// Logging.
const Log = {
    model: {
        UID: '',
        duration: 0,
        endTime: 0,
        flipped: 0,
        matched: 0,
        startTime: 0,
        won: false,
    },
    current: {},
    start: (uid) => {
        Log.current = Object.assign({}, Log.model);
        Log.current.UID = uid;
        Log.current.startTime = new Date().getTime();
    },
    set: (key, val) => {
        Log.current[key] = val;
    },
    increase: (key) => {
        Log.current[key]++;
    },
    save: () => {
        Log.current.endTime = new Date().getTime();
        console.log("Ez lehet a szép kiírás: ");
        console.log(Log.current);

        DB.create('games', Log.current).then(
            ref => {
                Log.current = Object.assign({}, Log.model);
            },
            err => console.error(err)
        );
    },    
}