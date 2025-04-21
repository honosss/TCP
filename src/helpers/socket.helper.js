class SocketHelper {
    static manageSockets() {
      const sockets = [];
      
      return {
        add: (socket) => sockets.push(socket),
        remove: (socket) => {
          const index = sockets.indexOf(socket);
          if (index !== -1) sockets.splice(index, 1);
        },
        getAll: () => [...sockets]
      };
    }
  }
  
  module.exports = SocketHelper;