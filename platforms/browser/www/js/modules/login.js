var windowLogin = true;
$(document).ready(function () {
    var db = window.openDatabase("dbAppFutureIsp", "1.0", "FutureIsp app DB", 200000);
    db.transaction(createDB, errorCB, successCB);

    getAppToken(function () {
        getEvents();
        getUser(userTrue);
    });

});

function createDB(tx) {
    //tx.executeSql('DROP TABLE IF EXISTS APPDATABASE');
    
    tx.executeSql('CREATE TABLE IF NOT EXISTS APPDATABASE (userToken)');
}

function errorCB(tx) {
    console.log(tx)
    alertInfo('Ops!',tx,'danger');
}

function successCB(tx) {
    //alert('ok')
}

var updateUser = function (userToken) {
    var db = window.openDatabase("dbAppFutureIsp", "1.0", "FutureIsp app DB", 200000);
    db.transaction(function (tx) {
        tx.executeSql('SELECT userToken FROM APPDATABASE', [], function (tx, res) {
            if (res.rows.length) {
                tx.executeSql('UPDATE APPDATABASE SET userToken = ?', [userToken]);
            }
        });
    }, errorCB, successCB);
};

var addUser = function (userToken) {
    var db = window.openDatabase("dbAppFutureIsp", "1.0", "FutureIsp app DB", 200000);
    db.transaction(function (tx) {
        tx.executeSql('INSERT INTO APPDATABASE (userToken) VALUES ("' + userToken + '")');
    }, errorCB, successCB);
};

var getUser = function (success) {
    var db = window.openDatabase("dbAppFutureIsp", "1.0", "FutureIsp app DB", 200000);
    db.transaction(function(tx){
        tx.executeSql('SELECT * FROM APPDATABASE', [], success, errorCB);
    }, errorCB);
};


var userTrue = function (tx, data) {
    if (data.rows.length) {
        window.gTokenSessions = data.rows.item(0).userToken;
        getLoggedUser();
    } else {
        window.gTokenSessions = false;
    }
};


var getUserToken = function (callback, data) {
    var query =  {
        'grant_type': 'password',
        'client_id': 2,
        'client_secret': 'nURqyXipcys8CpV3bZ0AfcoxQhiX1bGhMDbCd6tx',
        'username':data.email,
        'password':data.password,
        'scope': '*'
    };
    var obj = {
        url: futureIspApp.url.LOGIN_APP,
        type: "POST",
        noLoader: data.noLoader,
        contentType:'application/x-www-form-urlencoded',
        query: query
    };
    request(obj, function (json) {
        if (json) {
            window.gTokenSessions = json.token_type + ' ' + json.access_token;
            addUser(gTokenSessions);
            getLoggedUser();
            alertInfo('Sucesso', 'Obrigado por se registrar, agora você pode se inscrever nas atividades de sua preferência.', 'success');

            if(callback){
                callback();
            }
        }
    });
};

var getLoggedUser = function (callback) {
    var obj = {
        url: futureIspApp.url.LOGGED_USER,
        type: "GET",
        noLoader: true,
        auth: gTokenSessions,
        contentType: 'application/x-www-form-urlencoded',
        query: ''
    };
    
    request(obj, function (json) {
        parseToForm('userForm', json);
        if(json.avatar){
            $('#formAvatar').css('background-image', 'url("' + json.avatar + '"');
            $('#formAvatar').addClass('whImg');
            $('#formAvatar i').hide();

            $('#subscribeIcon i').css({
                'background-image': 'url("' + json.avatar + '")',
                'color': 'rgba(0,0,0,.0)',
                'border': '1px solid #fad67f'
            });
        }
        
        windowLogin = false;
        
        toogleDiscoveryForm();
        if (callback) {
            callback();
        }
    });
}

var getAppToken = function (callback) {
    var query =  {
        'grant_type': 'client_credentials',
        'client_id': 1,
        'client_secret': '69QZjnrTDr2QdyzkFjbQigRb9Zkebr5YpvBbB04U',
        'scope': '*'
    };
    var obj = {
        url: futureIspApp.url.LOGIN_APP,
        type: "POST",
        noLoader: true,
        contentType:'application/x-www-form-urlencoded',
        query: query
    };
    request(obj, function (json) {
        if (json) {
            window.gAuthorization = json.token_type + ' ' + json.access_token;
            if(callback){
                setTimeout(function(){
                    recSimpleTokenPush();
                    callback();
                },350);
            }
        }
    });
};

var registerUser = function(){
    
    //alert(windowLogin)
    
    if(windowLogin){
        var loginData = {};
        
        loginData.email = $('input[name=email]').val();
        loginData.password = $('input[name=password]').val();
        
        getUserToken('', loginData);
        return;
    }
    
    
    
    var query = $('.formApp form').serialize();
    //alert($('#formAvatar').css('background-image').match(/url\("([^)]+)\"/i)[1]);
    if($('#formAvatar').hasClass('whImg')){
        if(myAvatar){
            query += '&avatar=' + myAvatar;
        }else{
            query += '&avatar=' + $('#formAvatar').css('background-image').match(/url\("([^)]+)\"/i)[1];
        }
    }    
    var url = futureIspApp.url.REGISTER_USER;
    var obj = {
        url: url,
        type: "POST",
        //noLoader: true,
        auth: gAuthorization,
        contentType: 'application/x-www-form-urlencoded',
        query: query
    };
    //alert(query)
    request(obj, function (json) {
        //alert(json)
        var rgobj = {};
        rgobj = json;
        rgobj.password = $('input[name=password]').val();
        rgobj.noLoader = true;
        getUserToken('', rgobj);
        //console.log(json);
        //addUser();
    });
};