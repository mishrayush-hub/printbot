export const generateTransactionId = () => {
    const date = new Date();
    const timestamp = date.getTime().toString();
    const randomPart = Math.random().toString(36).substring(2, 10).toUpperCase();
    return `PB${timestamp}APP${randomPart}`;
  };