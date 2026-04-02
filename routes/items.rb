before do
  content_type 'application/json'
  headers 'Access-Control-Allow-Origin' => '*',
          'Access-Control-Allow-Methods' => 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers' => 'Content-Type'
end

options '*' do; 200; end

get '/' do
  content_type 'text/html'
  send_file File.join(File.dirname(__FILE__), '..', 'public', 'index.html')
end

get '/items' do
  ITEMS.order(:created_at).map { |r| row_to_h(r) }.to_json
end

post '/items' do
  body      = parse_body
  client_ts = body['client_timestamp']&.to_f || now
  id        = ITEMS.insert(payload: body.fetch('payload', {}).to_json, updated_at: client_ts, created_at: now)
  item      = row_to_h(ITEMS[id: id])
  broadcast('created', item)
  item.to_json
end

put '/items/:id' do
  body      = parse_body
  client_ts = body['client_timestamp']&.to_f || now
  row       = ITEMS[id: params[:id].to_i]
  halt 404, { error: 'Item não encontrado' }.to_json unless row
  return { conflict: true, current: row_to_h(row) }.to_json if client_ts < row[:updated_at]

  ITEMS.where(id: row[:id]).update(payload: body.fetch('payload', row[:payload]).to_json, updated_at: client_ts)
  item = row_to_h(ITEMS[id: row[:id]])
  broadcast('updated', item)
  item.to_json
end

delete '/items/:id' do
  body = begin
    parse_body
  rescue StandardError
    {}
  end
  client_ts = body['client_timestamp']&.to_f || now
  row       = ITEMS[id: params[:id].to_i]
  halt 404, { error: 'Item não encontrado' }.to_json unless row
  return { conflict: true, current: row_to_h(row) }.to_json if client_ts < row[:updated_at]

  ITEMS.where(id: row[:id]).delete
  broadcast('deleted', { id: row[:id] })
  { deleted: true, id: row[:id] }.to_json
end
