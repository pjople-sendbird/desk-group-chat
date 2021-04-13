
/**
 * Desk Application ID
 */
 var APP_ID;

 /**
  * Any user ID
  */
 var USER_ID;
 
 /**
  * Sendbird chat 
  */
 var sb;
  
 var CHANNEL;
 


 /**
  * CONNECT TO SENDBIRD 
  */
 function connect() {
     // Get input values and validate
     APP_ID = document.getElementById('appId').value;
     USER_ID = document.getElementById('userId').value;
     if (!APP_ID || !USER_ID) {
         return;
     }
     // Connect to Sendbird
     sb = new SendBird({ appId: APP_ID });
     sb.connect(USER_ID, (res, err) => {
         if (err) {
             console.dir(err);
             alert('Error connecting to SendBird Chat!');
         } else {
             addChannelHandler();
             document.getElementById('connectionContainer').style.display = 'none';
             document.getElementById('newMessageContainer').style.display = 'inline-block';
         }
     });
 }

 

 /**
  * Sendbird Chat handler
  * Wait for new messages
  */
 function addChannelHandler() {
     var channelHandler = new sb.ChannelHandler();
     channelHandler.onMessageReceived = (channel, message) => {
         console.log('new message from channel and message:'); 
         appendSingleMessage(message);
         CHANNEL = channel;
     };
     sb.addChannelHandler('UNIQUE_HANDLER_ID', channelHandler);
 }

 

 /**
  * Append a message to the list on screen
  */
 function appendSingleMessage(message) {
      if (message._sender) {
         const today = new Date().toLocaleDateString();
         const messageDate = new Date( message.createdAt ).toLocaleDateString();
         const out = `
         <div class="card mb-3">
             <div class="card-header d-flex justify-content-between">
                 <small>Sent by: ${ message._sender.userId }</small> 
                 <small>
                     ${ today != messageDate ? messageDate + ' - ' : '' }
                     ${ new Date( message.createdAt ).toLocaleTimeString() }
                 </small>
             </div>
             <div class="card-body">${ message.message }</div>
         </div>`;
         const currentContent = document.getElementById('messagesContainer').innerHTML;
         document.getElementById('messagesContainer').innerHTML = out + currentContent;    
     }
 }
 

 /**
  * Send a message to the agent
  * and to all users connected
  */
 function sendMessageToAgent() {
     const message = document.getElementById('messageInput').value;
     if (!message) {
         return;
     }
     if (!CHANNEL) {
         return;
     }
     CHANNEL.sendUserMessage(message, (message, error) => {
         appendSingleMessage(message);
     })
}

 
 