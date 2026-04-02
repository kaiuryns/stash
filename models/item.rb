ITEMS = DB[:items]

def row_to_h(row)
  row.merge(payload: JSON.parse(row[:payload]))
end

def now
  Time.now.to_f
end

def parse_body
  JSON.parse(request.body.read)
rescue StandardError
  halt 400, { error: 'JSON inválido' }.to_json
end

def broadcast(event, data)
  msg = { event: event, data: data }.to_json
  CLIENTS.each do |c|
    c.send(msg)
  rescue StandardError
    nil
  end
end
