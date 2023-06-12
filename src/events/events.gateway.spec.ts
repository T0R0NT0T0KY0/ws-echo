// @ts-nocheck
import { Test, TestingModule } from '@nestjs/testing';
import { EventsGateway } from './events.gateway';

describe('EventsGateway', () => {
  let gateway: EventsGateway;
  beforeAll(() => {
    consoleInfoMock = jest.spyOn(console, 'info').mockImplementation();
  });

  afterAll(() => {
    consoleInfoMock.mockRestore();
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EventsGateway],
    }).compile();

    gateway = module.get<EventsGateway>(EventsGateway);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should handle connection', () => {
    const client = { handshake: { address: 'mock-address', time: 'mock-time' }, emit: jest.fn() };

    gateway.handleConnection(client as any);

    expect(client.emit).toHaveBeenCalledWith('server_message', 'Hello!');
    expect(console.info).toHaveBeenCalledWith(
       `New Connected Socket. Address:${client.handshake.address}. Time: ${client.handshake.time}`
    );
  });

  it('should handle disconnection', () => {
    const client = { data: { name: 'mock-name' }, handshake: { address: 'mock-address', time: 'mock-time' }, emit: jest.fn(), leave: jest.fn() };

    gateway.getListenersCount = jest.fn().mockReturnValue(5);
    gateway.server = { to: jest.fn().mockReturnThis(), emit: jest.fn() };

    gateway.handleDisconnect(client as any);

    expect(client.emit).toHaveBeenCalledWith('server_message', 'Good Gye!');
    expect(client.leave).toHaveBeenCalledWith('public');
    expect(gateway.server.to).toHaveBeenCalledWith('public');
    expect(gateway.server.emit).toHaveBeenCalledWith(
       'server_message',
       `Listener ${client.data.name} disconnected. Listener count: 5`
    );
    expect(console.info).toHaveBeenCalledWith(
       `Disconnected Socket. Address:${client.handshake.address}. Time: ${client.handshake.time}`
    );
  });

  it('should enter the chat', () => {
    const client = { join: jest.fn(), emit: jest.fn(), data: {} };
    const name = 'mock-name';

    gateway.getListenersCount = jest.fn().mockReturnValue(10);
    gateway.server = { to: jest.fn().mockReturnThis(), emit: jest.fn() };

    gateway.enterTheChat(name, client as any);

    expect(client.join).toHaveBeenCalledWith('public');
    expect(client.data).toEqual({ name });
    expect(gateway.server.to).toHaveBeenCalledWith('public');
    expect(gateway.server.emit).toHaveBeenCalledWith('server_message', 'New Listener mock-name. Listener count: 10');
  });

  it('should not send message without a name', () => {
    const client = { emit: jest.fn() };
    const data = 'mock-data';

    gateway.server = { to: jest.fn().mockReturnThis(), emit: jest.fn() };

    gateway.newMessage(data, client as any);

    expect(client.emit).toHaveBeenCalledWith('server_message', 'To get started, enter a nickname');
    expect(gateway.server.to).not.toHaveBeenCalled();
  });

  it('should send message with a name', () => {
    const client = { data: { name: 'mock-name' } };
    const data = 'mock-data';

    gateway.server = { to: jest.fn().mockReturnThis(), emit: jest.fn() };

    gateway.newMessage(data, client as any);

    expect(gateway.server.to).toHaveBeenCalledWith('public');
    expect(gateway.server.emit).toHaveBeenCalledWith('message', { 'mock-name': 'mock-data' });
  });
});
