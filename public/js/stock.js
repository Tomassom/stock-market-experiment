// Stock.
const Stock = {
    model: {
        UID: '',
        game_id: '',
        type: 0,
        value: 0,
        status : 0,
        uid_original : '',
        created_by: 0,
    },
    current: {},
    start: (uid) => {
        Stock.current = Object.assign({}, Stock.model);
        Stock.current.UID = uid;
        Stock.current.startTime = new Date().getTime();
    },
    set: (key, val) => {
        Stock.current[key] = val;
    },
    increase: (key) => {
        Stock.current[key]++;
    },
    save: () => {
        //Log.current.endTime = new Date().getTime();
        //console.log("Ez lehet a szép kiírás: ");
        //console.log(Stock.current);

        DB.create('stocks', Stock.current).then(
            ref => {
                Stock.current = Object.assign({}, Stock.model);
            },
            err => console.error(err)
        );
    },    
}