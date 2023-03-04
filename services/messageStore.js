import {Datastore} from '@google-cloud/datastore';

const datastore = new Datastore();
const namespace = 'no-tongue';

function getConversationKey(conversationId) {
    return datastore.key({
        namespace,
        path: ['Conversation', conversationId],
    });
}

export async function getMessages(conversationId) {
    return (await datastore.get(getConversationKey(conversationId)))[0]?.messages;
}

export async function saveMessages(conversationId, messages) {
    let conversationKey = getConversationKey(conversationId);
    const conversation = (await datastore.get(conversationKey))[0] || {};
    conversation.messages = messages;
    await datastore.save({
        key: conversationKey,
        data: conversation,
    });

}