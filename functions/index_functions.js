const functions = require('firebase-functions');
const admin = require('firebase-admin');
// let firebase = require('firebase/app');
require('firebase/firestore');
admin.initializeApp();
let db = admin.firestore();

exports.addGame = functions.https.onCall((name, uid) => {
    db.collection('games')
        .add({
            gameName: name,
            author: uid
        })
        .then(() => {
            return { message: 'Success' };
        })
        .catch(error => {
            return error;
        });
});
exports.getGames = functions.https.onCall((data, context) => {
    const stuff = db
        .collection('games')
        .where('author', '==', context.auth.uid)
        .get();

    return stuff;
    // .then(snapshot => {
    // let items = [];
    // stuff.docs.forEach(doc => {
    //     let document = doc.data();
    //     // document.id = doc.id;
    //     items.push(document);
    // });

    // if (stuff.length === 0) {
    //     return 'No documents';
    // } else {
    //     return items;
    // }
    // })
    // .catch(error => {
    //     return error;
    // });
});
