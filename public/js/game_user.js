const Game_user = {
    model: {
        UID: '',
        game_id: '',
        p1: null,
        p2: null,
        created_by: 0,
        updated_by: 0,
    },
    current: {},
    start: (uid) => {
        Game_user.current = Object.assign({}, Game_user.model);
        Game_user.current.UID = uid;
        Game_user.current.startTime = new Date().getTime();
    },
    set: (key, val) => {
        Game_user.current[key] = val;
    },
    increase: (key) => {
        Game_user.current[key]++;
    },
    save: () => {
        //Log.current.endTime = new Date().getTime();
        //console.log("Ez lehet a szép kiírás: ");
        //console.log(Stock.current);

        DB.create('game_user', Game_user.current).then(
            ref => {
                Game_user.current = Object.assign({}, Game_user.model);
            },
            err => console.error(err)
        );
    },    
}