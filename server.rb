require 'sinatra'
require 'sequel'
require 'json'
require 'time'
require 'socket'
require 'faye/websocket'

Faye::WebSocket.load_adapter('thin')

# ── IP e QR ──────────────────────────────────────────────────────────────────
ip = Socket.ip_address_list
           .find { |a| a.ipv4? && !a.ipv4_loopback? }
           &.ip_address
$stdout.puts "\n👉  http://#{ip}:8080\n\n"
system("qrencode -t ANSIUTF8 'http://#{ip}:8080'")
$stdout.flush

# ── Configuração ──────────────────────────────────────────────────────────────
set :port, 8080
set :bind, '0.0.0.0'
set :public_folder, File.join(File.dirname(__FILE__), 'public')
set :server_settings, timeout: 0

DB = Sequel.sqlite('dados.db')
DB.create_table?(:items) do
  primary_key :id
  String  :payload,    null: false, default: '{}'
  Float   :updated_at, null: false
  Float   :created_at, null: false
end

CLIENTS = []

require_relative 'models/item'
require_relative 'routes/websocket'
require_relative 'routes/items'
