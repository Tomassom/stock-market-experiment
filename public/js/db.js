// Handle firebase firestore database.
const DB = {
    db: firebase.firestore(),
    get: async (path, where) => {
        let ref = DB.db.collection(path);
        ref = where ? ref.where(...where) : ref;
        const querySnapshot = await ref.get();
        const result = {};

        querySnapshot.forEach((doc) => {
            result[doc.id] = doc.data();
        });

        return result;
    },
    create: async (path, data) => {
        const docRef = await DB.db.collection(path).add(data);
        return docRef;
    },
    update: async (path, data) => {
        const docRef = DB.db.doc(`${path}`);
        await docRef.set(data);
    },
    update2: async (path, key, data) => {
        console.log("Document successfully written!", key);
        DB.db.collection(path).where('UID', '==', key).set(data).then(() => {
            console.log("Document successfully written!");
        });
    },
    delete: async (path) => {
        await DB.db.doc(`${path}`).delete();
    },
    listen: (path, where, callback) => {
        let ref = DB.db.collection(path).where(...where);
        ref.onSnapshot( (querySnapshot) => {
            const result = {};
            querySnapshot.forEach((doc) => {
                result[doc.id] = doc.data();
            });
            callback(result);
        });
    }
};