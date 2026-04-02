# Mini servidor self-hosted no Termux

## Setup (uma vez só)

```bash
# 1. Instala as dependências do sistema
pkg update && pkg install ruby

# 2. Na pasta do projeto, instala as gems
gem install bundler
bundle install

# 3. Descobre o IP do seu celular na rede local
ip route | grep src
# ou: ifconfig | grep -A2 wlan0
```

## Rodar o servidor

```bash
ruby server.rb
```

O servidor sobe em `http://0.0.0.0:4567`.
Qualquer dispositivo na mesma rede Wi-Fi consegue acessar pelo IP do seu celular.

---

## Testar com curl

```bash
# IP do celular com Termux (exemplo)
HOST=http://192.168.0.100:4567

# Listar itens
curl $HOST/items

# Criar item (client_timestamp = segundos Unix com decimais)
curl -X POST $HOST/items \
  -H "Content-Type: application/json" \
  -d '{"payload": {"text": "comprar leite"}, "client_timestamp": 1718200000.1}'

# Atualizar — timestamp mais recente, operação aceita
curl -X PUT $HOST/items/1 \
  -H "Content-Type: application/json" \
  -d '{"payload": {"text": "comprar leite e ovos"}, "client_timestamp": 1718200001.5}'

# Atualizar — timestamp MAIS ANTIGO, conflito detectado, devolve estado atual
curl -X PUT $HOST/items/1 \
  -H "Content-Type: application/json" \
  -d '{"payload": {"text": "versao velha"}, "client_timestamp": 1718199999.0}'
# ↑ resposta: {"conflict": true, "current": {...}}

# Deletar com timestamp mais recente — funciona
curl -X DELETE $HOST/items/1 \
  -H "Content-Type: application/json" \
  -d '{"client_timestamp": 1718200010.0}'

# Deletar com timestamp ANTIGO — rejeitado (item editado depois da decisão de delete)
curl -X DELETE $HOST/items/1 \
  -H "Content-Type: application/json" \
  -d '{"client_timestamp": 1718199900.0}'
```

---

## Como usar o cliente web

1. Abra o `client.html` no navegador de qualquer celular na mesma rede
2. Coloque o IP do Termux no campo "Servidor" (ex: `http://192.168.0.100:4567`)
3. Clique Conectar — a página faz pull automático a cada 5 segundos

Você pode também passar o IP pela URL:
```
file:///path/to/client.html?server=http://192.168.0.100:4567
```

---

## Como o controle de concorrência funciona

Cada requisição de escrita (PUT/DELETE) carrega um `client_timestamp`.

O servidor compara esse timestamp com o `updated_at` salvo no banco:

```
client_timestamp >= updated_at  →  operação aceita, updated_at atualizado
client_timestamp <  updated_at  →  conflito: devolve {conflict: true, current: {...}}
```

### Exemplo do cenário que você descreveu

| Horário | Quem | Ação |
|---------|------|------|
| 10:00   | C    | Decide deletar item #1 (ainda não mandou) |
| 10:01   | A    | PUT item #1 → texto "2 itens" (chega primeiro) |
| 10:03   | B    | PUT item #1 → texto "4 itens" (atualiza updated_at para 10:03) |
| 10:05   | C    | DELETE item #1 com client_timestamp=10:00 |

Na hora do DELETE do C:
- `client_timestamp` do C = 10:00
- `updated_at` no banco   = 10:03 (B foi o último)
- 10:00 < 10:03 → **conflito** — delete descartado, item sobrevive com o texto do B

### E se dois clientes editam ao mesmo tempo?

- A edita às 10:01 e manda com timestamp 10:01
- B edita às 10:01.5 e manda com timestamp 10:01.5

Se A chegar primeiro no servidor:
- updated_at vira 10:01
- B chega com 10:01.5 > 10:01 → aceito, vira o estado final

Se B chegar primeiro:
- updated_at vira 10:01.5
- A chega com 10:01 < 10:01.5 → conflito, A recebe a versão do B

Em ambos os casos o resultado é consistente: quem mandou o timestamp mais recente vence.
