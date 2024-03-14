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

    const GameUserStocksExport = async () => {

        let translations = {};

        await firebase.firestore().collection("stocks")
        //.where('game_id', '==', gameID)
        //.where('status', '==', 1)
        //.where('type', 'in', [1,3])
        .get().then((querySnapshot) => { 

            querySnapshot.forEach((doc) => {

                translations[doc.id] = doc.data();

                //translations.push(doc.data());

                console.log("Lekérdezés", doc.data() );

                // translations["a1"] = translations["a1"] +1; 
                //translations.push(translations);
            })
        });

        Object.assign({}, translations);
        console.log("Érték: ", translations);

        var jsonPretty = JSON.stringify(translations,null,2);   

        const container = $('body');
        container
        .html(output(jsonPretty));

        //Object.assign({}, translations[0]))
        //console.log("Érték: ", translations);
        //console.log("Érték: ", Object.assign({}, translations));
        
    }; 

    function output(inp) {
        document.body.appendChild(document.createElement('pre')).innerHTML = inp;
    };
    


    // Init game.
    (async () => {

            //const searchParams = new URLSearchParams(window.location.search);
            //console.log(searchParams.get('experiment'));
            //console.log(searchParams.getAll('experiment'));
            //for (const param of searchParams) { console.log(param); }


            /*
            await firebase.firestore().collection("users")
            .onSnapshot( (querySnapshot) => {
                querySnapshot.forEach((info) => { 
                    var jsonString = info.data();
                })
                var jsonPretty = JSON.stringify(jsonString,null,2);   

                const container = $('body');
                container
                .html(jsonPretty);

            }); */


        GameUserStocksExport();
        //checkLogin();
        //setLoginForm();
    })();

});