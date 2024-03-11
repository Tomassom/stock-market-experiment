// Users.
const Users = {
    model: {
        UID: '',
        cach: 20000,
        name: '',
        code: '',
        a1_number: 5,
        b1_number: 5,
        p1 : null,
        p2: null,
        created_by: 0,
    },
    current: {},
    start: (uid) => {
        Users.current = Object.assign({}, Users.model);
        Users.current.UID = uid;
        Users.current.startTime = new Date().getTime();
    },
    set: (key, val) => {
        Users.current[key] = val;
    },
    increase: (key) => {
        Users.current[key]++;
    },
    save: () => {
        //Log.current.endTime = new Date().getTime();
        //console.log("Ez lehet a szép kiírás: ");
        //console.log(Users.current);

        DB.create('users', Users.current).then(
            ref => {
                Users.current = Object.assign({}, Users.model);
            },
            err => console.error(err)
        );
    },    
}