$(() => {
    // Global variables.
    let settings = {};
    let startGame = 0;
    let level = '';
    let timer = 0;
    let User = null;
    let Stocks = '';
    let UserData = null;
    let upStock = null;
    let UserActiveStocks = null;
    
    const searchParams = new URLSearchParams(window.location.search);
    const gameID = searchParams.get('code') != null ? searchParams.get('code') : "4JWAexvbpoznYpFiDlG9";  

    // Check login state.
    const checkLogin = () => {
        const modal = $('#login-modal');
        const nameSpan = $('.user-name'); 
        const cashSpan = $('.cash');
        const asset_a = $('.asset_a');
        const asset_b = $('.asset_b');
        $('.modal-body.register').hide();

        firebase.auth().onAuthStateChanged(async (user) => {
            if (user) {
                User = Object.assign({}, user);

                
                UserInformation = DB.listen('users', ['UID', '==', User.uid], value => {
                    for (let k in value) {
                        cashSpan.text(value[k].cash);
                        nameSpan.text(value[k].name);
                        asset_a.text(value[k].a1_number);
                        asset_b.text(value[k].b1_number);
                        User.cash = value[k].cash;
                        User.name = value[k].name;
                        User.code = value[k].code;
                        User.a1_number = value[k].a1_number;
                        User.b1_number = value[k].b1_number;
                        //User.p1 = value[k].p1;
                        //User.p2 = value[k].p2;
                    }
                });

                //nameSpan.text((User.displayName || User.email));

                modal.modal('hide');
                //$('#startScreen').show();
                //await initCards();

                startScreen();
            } else {
                User = null;
                modal.modal('show');
            }
        });
    };

    const setLoginForm = () => {
        $('.switch-login, .switch-register').click((ev) => {
            const button = $(ev.target);
            if (button.hasClass('switch-register')) {
                $('.modal-body.login').slideUp();
                $('.modal-body.register').slideDown();
            } else {
                $('.modal-body.register').slideUp();
                $('.modal-body.login').slideDown();
            }
        });

        handleLogin();
        handleRegister();
        //handleGoogleLogin();

        // Signout.
        $('.sign-out-btn').click((ev) => {
            ev.preventDefault();
            firebase.auth().signOut();
        });

    };

    const handleLogin = () => {
        toggleLoginError('', true);

        const loginForm = $('.modal-body.login form');
        const email = loginForm.find('input[type=email]');
        const password = loginForm.find('input[type=password]');

        // Send auth request.
        loginForm.on('submit', (ev) => {
            ev.preventDefault();
            firebase
                .auth()
                .signInWithEmailAndPassword(email.val(), password.val())
                .catch(function (error) {
                    // Handle Errors here.
                    const errorCode = error.code;
                    const errorMessage = error.message;
                    toggleLoginError(errorMessage);
                });
        });
    };

    const handleRegister = () => {
        toggleLoginError('', true);

        const registerForm = $('.modal-body.register form');
        const email = registerForm.find('input[type=email]');
        const password = registerForm.find('input[type=password]');
        const name = registerForm.find('input[type=text][name=name]');
        const code = registerForm.find('input[type=text][name=code]');

        // Send auth request.
        registerForm.on('submit', (ev) => {
            ev.preventDefault();
            firebase
                .auth()
                .createUserWithEmailAndPassword(email.val(), password.val())
                .then((userCredential) => {
                    // Signed in 
                    let newUser = userCredential.user;

                    //let p1 = {p1_a_d:0, p1_a_n:0, p1_b_d:0, p1_b_n:0, p1_cash:0 }
                    //let p2 = {p2_a_d:0, p2_a_n:0, p2_b_d:0, p2_b_n:0, p2_cash:0 }

                    const time = $.now();
                    Users.set('UID', newUser.uid);
                    Users.set('name', name.val());
                    Users.set('code', code.val());
                    Users.set('cash', 20000);
                    Users.set('a1_number', 5);
                    Users.set('b1_number', 5);
                    //Users.set('p1', p1);
                    //Users.set('p2', p2);
                    Users.set('created_by', time);
                    Users.save();
                    
                  })
                .catch(function (error) {
                    // Handle Errors here.
                    const errorCode = error.code;
                    const errorMessage = error.message;
                    toggleLoginError(errorMessage);
                });
        });
    };

    const toggleLoginError = (errorMessage, hide) => {
        const alert = $('.modal-body.login .alert');
        if (hide) {
            return alert.hide();
        }

        alert.show()
            .text(errorMessage);
    };

    const DataList = (mode) => {

        let StockInformation = {};

        let listType = {
            "mode":{
                "a1":{
                    "formID": "a1_form",
                    "type" : 1,
                    "asset" : "a",
                    "button" : "a1_button",
                    "title" : "Current sell offers",
                    "button_name" : "Buy",
                },
                "a2":{
                    "formID": "a2_form",
                    "type" : 2,
                    "asset" : "a",
                    "button" : "a2_button",
                    "title" : "Current buy offers",
                    "button_name" : "Sell",
                },
                "b1" : {
                    "formID": "b1_form",
                    "type" : 3,
                    "asset" : "b",
                    "button" : "b1_button",
                    "title" : "Current sell offers",
                    "button_name" : "Buy",
                },
                "b2" : {
                    "formID": "b2_form",
                    "type" : 4,
                    "asset" : "b",
                    "button" : "b2_button",
                    "title" : "Current buy offers",
                    "button_name" : "Sell",
                },               
            }
        }; 
        
        // stock_a_sell lista
        firebase.firestore().collection("stocks")
            .where('game_id', '==', gameID)
            .where('type', '==', listType.mode[mode].type)
            .where('status', '==', 1)
            .orderBy('value', 'desc')
            .onSnapshot( 
            (querySnapshot) => {

            let stocklist = "";
            stocklist += `<div class="pb-2">${listType.mode[mode].title}</div><table class="table table-striped">`;
            querySnapshot.forEach((doc_stock) => {

                stocklist += `
                    <tr>
                    <th scope="row">${doc_stock.data().value}</th>`;

                    if ( User.uid == doc_stock.data().UID && User.uid != null)
                    {
                        stocklist += `
                        <td><button type="submit" class="btn btn-secondary btn-sm disabled">Own</button></td>
                        <td><button type="submit" class="btn btn-danger su btn-sm" id="${doc_stock.id}">Del</button></td>
                        `;
                    }
                    else{
                        stocklist += `
                        <td><button type="submit" class="btn btn-primary sd btn-sm" data-stockvalue="43" id="${doc_stock.id}">${listType.mode[mode].button_name}</button></td>
                        `;   
                    }

                stocklist += `
                </tr>`;
            });

            stocklist += `
            </table>`;

            const container = $('#' + listType.mode[mode].formID);
            container
            .html(stocklist)
            .find('.sd, .su')
            .click(async (ev) => {
                
                ev.stopPropagation();
                const id = ev.target.id;
                //data[id].won = !data[id].won;
                const method = $(ev.target).hasClass('su') ? 'delete' : 'update';
                if ( method == "delete")
                {
                    await DB[method](`stocks/${ev.target.id}`, ev.target.id);
                    if ( mode == "a1" ) { UserDataUpdate({"increase_a1" : 1}); }
                    if ( mode == "b1" ) { UserDataUpdate({"increase_b1" : 1}); }
                }
                else{
                    // Veszek - Eladok részvényt
                    firebase.firestore().collection("users").where('UID', '==', User.uid).get().then((querySnapshot) => {
                        querySnapshot.forEach((doc) => {

                            firebase.firestore().collection("stocks").doc(ev.target.id)
                            .onSnapshot((doc2) => {

                                if ( doc2.data().status )
                                {
                                    // Itt veszek részvényt, ezért a részvényszámom nő és a pénzem csökken
                                    if ( mode == "a1" ){ UserDataUpdate({"increase_a1" : 1, "decrease_cash" : parseInt(doc2.data().value) }); }

                                    // Itt eladok részvényt, tehát a részvényszámom csökken és pénzem nő
                                    if ( mode == "a2" ){ UserDataUpdate({"decrease_a1" : 1, "increase_cash" : parseInt(doc2.data().value) }); }

                                    // Itt veszek részvényt, ezért a részvényszámom nő és a pénzem csökken
                                    if ( mode == "b1" ){ UserDataUpdate({"increase_b1" : 1, "decrease_cash" : parseInt(doc2.data().value) }); }

                                    // Itt eladok részvényt, tehát a részvényszámom csökken és pénzem nő
                                    if ( mode == "b2" ){ UserDataUpdate({"decrease_b1" : 1, "increase_cash" : parseInt(doc2.data().value) }); }
                                }
                                
                            });
                        });
                    });
                    
                    firebase.firestore().collection("stocks").doc(ev.target.id)
                    .onSnapshot( (doc2) => {

                        if ( doc2.data().uid_original == "" && doc2.data().status == 1)
                        {
                            upStock = {
                                UID: User.uid,
                                game_id : doc2.data().game_id,
                                value: doc2.data().value,
                                type: doc2.data().type,
                                asset: doc2.data().asset,
                                uid_original: doc2.data().UID,
                                status : 0,
                                created_by: doc2.data().created_by,
                                updated_by: formatDate(new Date())
                            }
                            DB["update"](`stocks/` + doc2.id, upStock);

                            // vettem részvényt
                            if ( mode == "a1" ) { UserDataUpdate({"increase_cash" : parseInt(doc2.data().value) }, doc2.data().UID); }
                            // Eladok?
                            if ( mode == "a2" ) { UserDataUpdate({"increase_a1" : 1, "decrease_cash" : parseInt(doc2.data().value) }, doc2.data().UID); }

                            // vettem részvényt
                            if ( mode == "b1" ) { UserDataUpdate({"increase_cash" : parseInt(doc2.data().value) }, doc2.data().UID); }
                            // Eladok?
                            if ( mode == "b2" ) { UserDataUpdate({"increase_b1" : 1, "decrease_cash" : parseInt(doc2.data().value) }, doc2.data().UID); }
                        }
                    });

                } // Update else ág vége
                //console.log("törlés vagy vásárlás", method);
            });
        });
        
        // Innen indul a részvény eladás rögzítése
        const Sell_A_Form = $('.' + listType.mode[mode].formID);
        const value_text = Sell_A_Form.find('input[type=text]');

        // Elmentjük a részvényt
        Sell_A_Form            
        .find('.' + listType.mode[mode].button)
        .click(async (ev) => {
            //ev.preventDefault();
            ev.stopPropagation();

                Stock.set('UID', User.uid); 
                Stock.set('game_id', gameID); 
                Stock.set('uid_original', '');
                Stock.set('type', listType.mode[mode].type);
                Stock.set('asset', listType.mode[mode].asset);
                Stock.set('value', value_text.val());
                Stock.set('status', 1);
                Stock.set('created_by', formatDate(new Date()));
                Stock.set('updated_by', '');

                let error_input = 0;
                let error_msg = [];
                if ( listType.mode[mode].type == 1 && User.a1_number == 0 ){
                    error_input = 1;
                    error_msg.push("Nincs eladható részvény");

                }
                if ( listType.mode[mode].type == 3 && User.b1_number == 0 ){
                    error_input = 1;
                    error_msg.push("Nincs eladható részvény");
                }

                if (value_text.val()<=0 || value_text.val()>999 ){
                    error_input = 1;   
                    error_msg.push("Value 0 between 999"); 
                }

                if ( value_text.val() == "" ){
                    error_input = 1;   
                    error_msg.push("Required");  

                }

               // console.log("Type: ", listType.mode[mode].type, " Number: ", User.a1_number, "error_input", error_input, error_msg);

                if ( !error_input )
                {
                    Stock.save();
                    value_text.val("");
    
                    if ( mode == "a1" ) { 
                        UserDataUpdate({"decrease_a1" : 1}); 
                    }
                    if ( mode == "b1" ) { 
                        UserDataUpdate({"decrease_b1" : 1}); 
                    }
                    Sell_A_Form.find('input[type=text]').removeClass( "is-invalid" );
                }
                else{
                    Sell_A_Form.find('input[type=text]').addClass( "is-invalid" );
                    value_text.val("");
                    let startExperiment = setInterval( 
                        function () {
                            Sell_A_Form.find('input[type=text]').removeClass( "is-invalid" ); 
                        }, 3000);
                }
            });
    };


    const UserActiveStocksCount = async () => {

        let translations = {"a1" : 0, "b1" : 0};

        await firebase.firestore().collection("stocks")
        .where('UID', '==', User.uid)
        .where('game_id', '==', gameID)
        .where('status', '==', 1)
        //.where('type', 'in', [1,3])
        .get().then((querySnapshot) => { 

            querySnapshot.forEach( async (doc) => { 
                if ( doc.data().type == 1 )
                {
                    translations["a1"] = translations["a1"] +1; 
                }
                if ( doc.data().type == 3 )
                {
                    translations["b1"] = translations["b1"] +1; 
                }
                await DB["delete"](`stocks/${doc.id}`,  doc.id);
            })
        });   

        Object.assign({}, translations[0]); 
        if ( translations.a1 != 0 || translations.b1 != 0)
        {
            User.a1_number = User.a1_number + translations.a1;
            User.b1_number = User.b1_number + translations.b1;
            UserDataUpdate({"increase_a1" : translations.a1, "increase_b1" : translations.b1  });   
        }

        return translations;
    }; 

    /*
    const UserActiveStocksCount = async () => {

        let a1 =  User.a1_number ;
        let b1 =  User.b1_number ;
        let translations = {"a1" : 0, "b1" : 0};

        await firebase.firestore().collection("stocks")
        .where('UID', '==', User.uid)
        .where('game_id', '==', gameID)
        .where('status', '==', 1)
        .where('type', 'in', [1,3])
        .get().then((querySnapshot) => { 

            querySnapshot.forEach((doc) => {

                //DB[method](`stocks/${ev.target.id}`, ev.target.id);

                //translations.push(doc.data());

                if ( doc.data().type == 1 )
                {
                    translations["a1"] = translations["a1"] +1; 
                }
                if ( doc.data().type == 3 )
                {
                    translations["b1"] = translations["b1"] + 1; 
                }
                //translations.push(translations);
            })
        });
        //Object.assign({}, translations[0]))
        //console.log("Érték: ", translations);
        //console.log("Érték: ", Object.assign({}, translations));
        return Object.assign({}, translations);
        
    }; */

    const GamePartOne = async () => {

        UserActiveStocksCount();

        let htmlString = "";

        await firebase.firestore().collection("games")
        .doc(gameID)
        .get()
        .then((doc) => {
            if (doc.exists) {       
     
                let a_d = User.a1_number * doc.data().p1_a_dm;
                let b_d = User.b1_number * doc.data().p1_b_dm;

                let p1_cash = User.cash;
                let p1_d_total = + a_d + b_d;
                let p1_total_cash = User.cash + a_d + b_d;

                htmlString += `
                <div class="container text-center">
                <div class="row">
        
                  <div class="col align-self-center pt-5">
                    <h2>End of Periodus 1</h2><br>
                    <p>Dividend per share of Asset A : <b>${doc.data().p1_a_dm}</b> </p>
                    <p>Dividend per share of Asset B : <b>${doc.data().p1_b_dm}</b> </p><br>
        
                    <p>Number of Asset A in your inventory : <b>${User.a1_number}</b> </p>
                    <p>Number of Asset B in your inventory : <b>${User.b1_number}</b> </p><br>
        
                    <p>Total dividends of assets A paid in this period: <b>${a_d}</b> </p>
                    <p>Total dividends of assets B paid in this period: <b>${b_d}</b> </p><br>
        
                    <p>Cash Account balance: <b>${p1_cash}</b></p>
                    <p>Dividend Accound balance: <b>${p1_d_total}</b></p>
                    <p>Total Accound balance: <b>${p1_total_cash}</b> </p>
                  </div>
        
                </div>
              </div>`;

              let p1Data = {p1_a_d: a_d, p1_a_n:User.a1_number, p1_b_d: b_d, p1_b_n:User.b1_number, p1_cash:p1_cash, p1_total_cash: p1_total_cash };
              //UserDataUpdate({"p1" : p1Data});
              GameUserSave({"p1" : p1Data});

            } 
            const container = $("#periodus_1_end");
            container
            .html(htmlString);

        });

        $(".period_info").html("The period is 2 ");
        TimerExperiment(30, "period_two_start"); 
    };

    const GameEnd = async () => {

        UserActiveStocksCount();

        let htmlString = "";
        
        await firebase.firestore().collection("games")
        .doc(gameID)
        .get()
        .then((doc) => {
            if (doc.exists) {

                let a_d = User.a1_number * doc.data().p2_a_dm;
                let b_d = User.b1_number * doc.data().p2_b_dm;

                let p2_cash = User.cash;
                let p2_d_total = + a_d + b_d;

                let p2_total_cash = User.cash + a_d + b_d;

                htmlString += `
                <div class="container text-center">
                <div class="row">
        
                  <div class="col align-self-center pt-5">
                    <h2>Game is over</h2><br>
                    <p>Dividend per share of Asset A : <b>${doc.data().p2_a_dm}</b> </p>
                    <p>Dividend per share of Asset B : <b>${doc.data().p2_b_dm}</b> </p><br>
        
                    <p>Number of Asset A in your inventory : <b>${User.a1_number}</b> </p>
                    <p>Number of Asset B in your inventory : <b>${User.b1_number}</b> </p><br>
        
                    <p>Total dividends of assets A paid in this period: <b>${a_d}</b> </p>
                    <p>Total dividends of assets B paid in this period: <b>${b_d}</b> </p><br>
        
                    <p>Cash Account balance: <b>${p2_cash}</b> </p>
                    <p>Dividend Accound balance: <b>${p2_d_total}</b> </p>
                    <p>Total Accound balance: <b>${p2_total_cash}</b> </p>
                  </div>
        
                </div>
              </div>`;

              let p2Data = {p2_a_d: a_d, p2_a_n: User.a1_number, p2_b_d: b_d, p2_b_n: User.b1_number, p2_cash:User.cash, p2_total_cash: p2_total_cash };
              //UserDataUpdate({"p2" : p2Data});
              GameUserSave({"p2" : p2Data});

            } 
            const container = $("#period_2_end");
            container
            .html(htmlString);

        });
    };

    const StockHistory = ( mode = {}) => {

            console.log("Hitory mode: ", mode );
            // Kereskedés törénetének kírása
            firebase.firestore().collection("stocks")
            .where('game_id', '==', gameID)
            .where('status', '==', 0)
            .where('type', 'in', mode.type)
            .orderBy('updated_by', 'desc')
            //.limit(10)
            .onSnapshot( 
            (querySnapshot) => {

                let stocklist = "";
                stocklist += `<div class="pb-2">${mode.name} history</div><table class="table table-striped">`;
                querySnapshot.forEach((doc_stock) => { 
                    if ( doc_stock.data().status == 0)
                    {
                        let own_msg = "";
                        if ( User.uid == doc_stock.data().UID)
                        {
                            own_msg = " Own";
                        }
                        stocklist += `
                        <tr><td>${doc_stock.data().value}</td><td>${own_msg}</td></tr>`;
                    }
                })
                stocklist += `</table>`;

                const container = $(mode.class);
                container
                .html(stocklist);
            });
            
    };

    const UserDataUpdate = async ( mode = {}, modeUserId = "" ) => {

        let UserID = modeUserId != "" ? modeUserId : User.uid;

        firebase.firestore().collection("users").where('UID', '==', UserID).get().then((querySnapshot) => {
            querySnapshot.forEach( async (doc) => {

                const upData = {
                    "UID": UserID,
                    "cash": doc.data().cash,
                    "name": doc.data().name,
                    "code": doc.data().code,
                    "a1_number": doc.data().a1_number,
                    "b1_number": doc.data().b1_number,
                    //"p1": doc.data().p1,
                    //"p2": doc.data().p2,
                };

                if ( mode.hasOwnProperty("increase_a1") ){ upData.a1_number = doc.data().a1_number + mode.increase_a1; }
                if ( mode.hasOwnProperty("decrease_a1") ){ upData.a1_number = doc.data().a1_number - 1; }
                if ( mode.hasOwnProperty("increase_b1") ){ upData.b1_number = doc.data().b1_number +  mode.increase_b1; }
                if ( mode.hasOwnProperty("decrease_b1") ){ upData.b1_number = doc.data().b1_number - 1; }
                if ( mode.hasOwnProperty("increase_cash") ){ upData.cash = upData.cash + parseInt(mode.increase_cash); }
                if ( mode.hasOwnProperty("decrease_cash") ){ upData.cash = doc.data().cash - mode.decrease_cash; }
                //if ( mode.hasOwnProperty("p1") ){ upData.p1 = mode.p1; }
                //if ( mode.hasOwnProperty("p2") ){ upData.p2 = mode.p2; }

                //console.log("Adattömb: ", upData, " Művelet: ", mode);
                await DB["update"](`users/` + doc.id, upData);
            })
        })

    };

    const GameUserSave = ( mode = {} ) => {

        firebase.firestore().collection("game_user")
        .where('UID', '==', User.uid)
        .where('game_id', '==', gameID)
        .get().then((querySnapshot) => {
            if (!querySnapshot.empty) {
                querySnapshot.forEach((doc) => {

                    const upData = {
                        "UID": User.uid,
                        "game_id": gameID,
                        "p1": mode.hasOwnProperty("p1") ? mode.p1 : doc.data().p1,
                        "p2": mode.hasOwnProperty("p2") ? mode.p2 : doc.data().p2,
                        "created_by": doc.data().created_by,
                        "updated_by": formatDate(new Date())
                    };
                    DB["update"](`game_user/` + doc.id, upData);  
                })
            }else{
                Game_user.set('UID', User.uid); 
                Game_user.set('game_id', gameID); 
                Game_user.set('p1', mode.p1); 
                Game_user.set('p2', ''); 
                Game_user.set('created_by', formatDate(new Date()));
                Game_user.set('updated_by', '');
                Game_user.save();          
            }
        })
        .catch((error) => {
        });

        /*
            querySnapshot.forEach((doc) => {
                /*
                const upData = {
                    "UID": User.uid,
                    "game_id": gameID,
                    "p1": doc.data().p1,
                    "p2": mode.p2,
                    "created_by": doc.data().created_by,
                    "updated_by": formatDate(new Date())
                };*//*

                console.log("mentünk", User.uid, gameID, mode);
                //DB["game_user"](`game_user/` + doc.id, upData);
            })
        })
        .catch((error) => {

            console.log("Újat hozunk létre", User.uid, gameID, mode);
            /*
            Game_user.set('UID', User.uid); 
            Game_user.set('game_id', gameID); 
            Game_user.set('p1', mode.p1); 
            Game_user.set('created_by', formatDate(new Date()));
            Game_user.set('updated_by', '');
            Game_user.save(); *//*

            
        }); */

    };


    const TimerExperiment = (timer, method) => {
        let counterTime = timer;
        let stringTime = "";

        //$('#experiment').show();
        let timeCounter = setInterval( 
            function () { 

                if ( counterTime ) {
                    counterTime = counterTime-1;
                    let remainder = counterTime % 60;
                    if ( remainder < 10 ){
                        stringTime = "0" + remainder;
                    }
                    else {
                        stringTime = remainder;
                    }
                    let wholeNumber = (counterTime - remainder) / 60;
                   
                    $('.timer').html( wholeNumber + " : " + stringTime );
                }
                else {

                    if ( method == "part_one_end"){
                        $('#experiment').hide();
                        $('#periodus_1_end').show();
                        GamePartOne();
                    }

                    if ( method == "period_two_start"){
                        $('#experiment').show();
                        $('#periodus_1_end').hide();
                        TimerExperiment(180, "gameEnd");
                    }

                    if ( method == "gameEnd"){
                        $('#experiment').hide();
                        $('#period_2_end').show();
                        GameEnd();
                        console.log("vége");
                    }
                    

                    clearInterval(timeCounter); 
                }
            
            }, 1000); 
    };


    const padTo2Digits = (num) => {
        return num.toString().padStart(2, '0');
    };
      
    const formatDate = (date) => {
    return (
        [
        date.getFullYear(),
        padTo2Digits(date.getMonth() + 1),
        padTo2Digits(date.getDate()),
        ].join('-') +
        ' ' +
        [
        padTo2Digits(date.getHours()),
        padTo2Digits(date.getMinutes()),
        padTo2Digits(date.getSeconds()),
        ].join(':')
    );
    };

    const startScreen = async() => {

        DataList("a1");
        DataList("a2");
        DataList("b1");
        DataList("b2");
        StockHistory({name: "A", type: [1, 2], class : "#a_history" });
        StockHistory({name: "B", type: [3, 4], class : "#b_history" });

        //$('#experiment').hide();
        $('#startScreen').show();

        gameData = await DB.get('games');
        timer = gameData[gameID].startTime;

        let statusString = gameData[gameID].status ? '<i class="text-success">Active</i>' : '<i class="text-danger">Inactive</i>';

        //const date1 = new Date();
        //const date2 = new Date(timer);
        //const diffTime = Math.abs(date2 - date1);
        //const diffSeconds = Math.ceil(diffTime / (1000 )); 

        //console.log("DiffSeconds: ", diffSeconds);

        //.fadeIn(250)
            // Itt lehet időre beállítani a kísérlet kezdetét
            //$('#experiment').hide(); 

            let htmlString = `
                <div class="container text-center">
                <div class="row">
        
                <div class="col align-self-center pt-5">
                    <h2>Stock Market Experiment</h2><br><br>
                    <h4>Code:  ${statusString}</h4><br><br>
                    <h4>Start time: <i class="timer">${timer}</i> </h4>
                </div>
        
                </div>
            </div>            
            `;

            const container = $("#startScreen");
            container
            .html(htmlString);

            let startExperiment = setInterval( 
                function () {
                    let dt = new Date();

                    let timestring = 
                    dt.getFullYear() + '-'
                    + ('0' + (dt.getMonth()+1)).slice(-2) + '-'
                    + ('0' + dt.getDate()).slice(-2) + ' '
                    + ('0' + dt.getHours()).slice(-2) + ':'
                    + ('0' + dt.getMinutes()).slice(-2);

                    //const date2 = new Date(timer);
                    //const diffTime = Math.abs(date2 - dt);
                    //const diffSeconds = Math.ceil(diffTime / (1000 )); 

                    //console.log("timer, ", timer, "timestring", timestring);

                    if ( timer == timestring)
                    {
                        console.log("Indul a kísérlet");
                        $('#experiment').show();
                        $('#startScreen').hide();
                        TimerExperiment(180, "part_one_end");
                        clearInterval(startExperiment); 
                    }
                    else{
                        //console.log("Várni kell"); 
                    }
                }
            , 1000);
    };

    const gameIDCheck = () => {
        
        const searchParams = new URLSearchParams(window.location.search);
        let getCode = searchParams.get('code') != null ? searchParams.get('code') : "4JWAexvbpoznYpFiDlG9";  

        firebase.firestore().collection("games").doc(getCode).get().then((doc) => {
            if (doc.exists) {
                //console.log("Document data:", doc.data());
                const gameID = doc.id;
            } else {
                // doc.data() will be undefined in this case
                console.log("No such document!");
                const gameID = "";
            }
        }).catch((error) => {
            console.log("Error getting document:", error);
        });
            

    };

    // Init game.
    (async () => {

            //const searchParams = new URLSearchParams(window.location.search);
            //console.log(searchParams.get('experiment'));
            //console.log(searchParams.getAll('experiment'));
            //for (const param of searchParams) { console.log(param); }
            
            /*
            firebase.firestore().collection("stocks")
            .get().then((querySnapshot) => {
                if (!querySnapshot.empty) {
                    querySnapshot.forEach((doc) => {

                            DB["delete"](`stocks/${doc.id}`,  doc.id);
                    })
                }
            }); 

            await firebase.firestore().collection("users")
            .onSnapshot( (querySnapshot) => {
                querySnapshot.forEach((info) => { 
                    var jsonString = info.data();
                    var jsonPretty = JSON.stringify(jsonString,null,2);   

                    const container = $('#jsontest');
                    container
                    .html(jsonPretty);
                })

            });*/


        $('#experiment').hide();
        //gameIDCheck();
        //startScreen();
        //TimerExperiment(30, "part_one_end");
        checkLogin();
        setLoginForm();
    })();
});