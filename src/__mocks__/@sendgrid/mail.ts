const mockSendGrid = {
  setApiKey: jest.fn(),
  send: jest.fn(),
}

jest.mock('@sendgrid/mail', () => mockSendGrid)

export default mockSendGrid
