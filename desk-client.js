
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

/**
 * Created ticket
 */
var TICKET;



/**
 * CONNECT TO SENDBIRD AND TO DESK
 */
function connect() {
    // Get input data
    APP_ID = document.getElementById('appId').value;
    USER_ID = document.getElementById('userId').value;
    if (!APP_ID || !USER_ID) {
        return;
    }
    // Connect to SDK, add handler and connect to Desk
    sb = new SendBird({ appId: APP_ID });
    sb.connect(USER_ID, (res, err) => {
        if (err) {
            console.dir(err);
            alert('Error connecting to SendBird Chat!');
        } else {
            addChannelHandler();
            SendBirdDesk.setDebugMode();
            SendBirdDesk.init(SendBird);
            SendBirdDesk.authenticate(USER_ID, (res, err) => {
                if (err) {
                    console.dir(err);
                    alert('Error connecting to SendBird Desk!');
                } else {
                    createTicketSdk();
                }
            });
        }
    });
}


/**
 * CREATE TICKET
 */
function createTicketSdk() {
    // Get input data and validate
    const name = document.getElementById('name').value;
    const problem = document.getElementById('problem').value;
    const title = 'New ticket from demo';
    if (!name || !problem) {
        alert('Please enter a name and your problem');
        return;
    }
    if (!problem) {
        alert('Please enter your message or problem');
        return;
    }
    // Create ticket and send message
    SendBirdDesk.Ticket.create(
        title,
        USER_ID,
        "group-web-app",
        {
            name /** send optional ticket fields */
        },
        (ticket, err) => {
            if (err) {
                console.dir(err);
                alert('Unable to create this ticket!');
            }
            TICKET = ticket;
            console.log('Ticket created: '); console.dir(ticket);
            // Send a message to start the conversation
            ticket.channel.sendUserMessage(problem, (response, error) => {
                alert('TICKET CREATED. CHECK YOUR DESK DASHBOARD!');
                document.getElementById('connectionContainer').style.display = 'none';
                document.getElementById('inviteUserContainer').style.display = 'inline-block';
                document.getElementById('newMessageContainer').style.display = 'inline-block';
            })
        }
    );
}


/**
 * Sendbird Chat handler
 * Wait for message received
 */
function addChannelHandler() {
    var channelHandler = new sb.ChannelHandler();
    channelHandler.onMessageReceived = (channel, message) => {
        console.log('new message from channel and message:'); 
        appendSingleMessage(message);
    };
    sb.addChannelHandler('UNIQUE_HANDLER_ID', channelHandler);
}


/**
 * Append a message to the list on screen
 */
function appendSingleMessage(message) {
    var sender = message._sender ? message._sender.userId : 'Desk Agent';
    const today = new Date().toLocaleDateString();
    const messageDate = new Date( message.createdAt ).toLocaleDateString();
    const out = `
    <div class="card mb-3">
        <div class="card-header d-flex justify-content-between">
            <small>Sent by: ${ sender }</small> 
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


/**
 * Send a message to the agent
 * and to other users connected
 */
function sendMessageToAgent() {
    const message = document.getElementById('messageInput').value;
    if (!message) {
        return;
    }
    TICKET.channel.sendUserMessage(message, (message, error) => {
        appendSingleMessage(message);
    })
}


/**
 * Invite any of your users to the conversation
 */
function inviteUserToTicketDiscussion() {
    const userIdToInvite = document.getElementById('userIdToInvite').value;
    if (!userIdToInvite) {
        return;
    }
    if (!TICKET) {
        return;
    }
    var userIds = [userIdToInvite];
    TICKET.channel.inviteWithUserIds(userIds, function(response, error) {
        if (error) {
            alert('Error inviting users');
        } else {
            alert('User invited!');
        }
    });
}

