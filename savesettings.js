const {app} = require('electron');
const settings = require('electron-settings');


const saveBtn = document.querySelector('#save-btn');
const accountsText = document.querySelector('#accounts-text');
const catchAllDomain = document.querySelector('#catch-all');
const password = document.querySelector('#password');
const accountsLoaded = document.querySelector('#accounts-loaded');
const saveStatus = document.querySelector('#save-status');


saveBtn.addEventListener('click', function(e){
    e.preventDefault();
    //Save the user inputted accounts to the settings as a perssisted user settings.
    var accountsVal = accountsText.value;
    var accountsList = accountsVal.split('\n');
    var accountArray = new Array(accountsList.length);

    class Account{
        constructor(user, pass){
            this.username = user;
            this.password = pass;
        }
    }

    for(var i = 0; i < accountsList.length; i++){
        if (accountsList[i] !== '' || accountsList[i] !== null){
            accountData = accountsList[i].split(':');
            var acc = new Account(accountData[0], accountData[1]);
            accountArray[i] = acc;
        }
    }
    
    settings.set('accountList', accountArray);

    var accountSettings = {
        domain: catchAllDomain.value,
        password: password.value
    }

    settings.set('accountSettings', accountSettings);

    console.log(settings.get('accountSettings'));
    console.log(settings.get('accountList'));

    saveStatus.textContent = 'Settings Saved!';


    
    
})

window.addEventListener('load', function(){
    var accountList = settings.get('accountList');
    for (var i = 0; i < accountList.length; i++){
        var accountStr = `${accountList[i].username}:${accountList[i].password}\n`; 
        accountsText.value += accountStr;
    }
    accountsLoaded.textContent = `${accountList.length} Accounts Loaded`;
    var accSettings = settings.get('accountSettings');
    catchAllDomain.value = accSettings.domain;
    password.value = accSettings.password;
})
