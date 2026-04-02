get '/ws' do
  if Faye::WebSocket.websocket?(request.env)
    ws = Faye::WebSocket.new(request.env)
    ws.on :open do CLIENTS << ws end
    ws.on :close do CLIENTS.delete(ws) end
    ws.on :message do |e| end
    ws.rack_response
  end
end
