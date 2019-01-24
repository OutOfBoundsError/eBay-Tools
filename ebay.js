const electron = require('electron');
const request = require('request');
const fs = require('fs');
require('chromedriver');
const chrome = require('selenium-webdriver/chrome');
const {Builder, By, Key, until, selenium} = require('selenium-webdriver');
const settings = require('electron-settings');

const formWatch = document.querySelector('.form-watch');
const formView = document.querySelector('.form-view');
const formAccount = document.querySelector('.form-account');

const watchStatus = document.querySelector('#watch-status');
const viewStatus = document.querySelector('#view-status');
const accountStatus = document.querySelector('#account-status');


formWatch.addEventListener('submit', ebayWatch);
formView.addEventListener('submit', ebayView);
formAccount.addEventListener('submit', ebayAccount);

class Account{
    constructor(user, pass){
        this.username = user;
        this.password = pass;
    }
}

function ebayWatch(e){
    e.preventDefault();

    var prodLink = document.querySelector('#ebayWatchLink').value;
    var amount = document.querySelector('#amtWatchers').value;    
    var userInput = {
        productUrl: prodLink,
        amount: amount
    }

    const accountList = settings.get('accountList');

    function updateStatus(status){
        watchStatus.textContent = status;
    }

    async function watch(account, userInput, taskIndex){
        console.log('Starting...');
        updateStatus(`[TASK ${taskIndex}] Starting`);
        const driver = await new Builder().forBrowser('chrome').setChromeOptions(new chrome.Options().headless()).build();
        await driver.get('https://ebay.com/signin/');      
        try{
            updateStatus(`[TASK ${taskIndex}] Signing in...`);
            await driver.findElement(By.id('userid')).sendKeys(account.username);
            await driver.findElement(By.id('pass')).sendKeys(account.password);
            await driver.findElement(By.id('sgnBt')).click();
            console.log('Signed In!');
            updateStatus(`[TASK ${taskIndex}] Successfully Signed in!`);
            await driver.get(userInput.productUrl);
            var watchStatus = await driver.findElement(By.className('vi-atw-txt')).getText();
            if (watchStatus.includes('Add')){
                await driver.findElement(By.id('vi-atl-lnk')).click();
                console.log('Successfully Watched.')
                updateStatus(`[TASK ${taskIndex}] Successfully Watched.`);
            }
            else {
                console.log('Already Watching');
                updateStatus(`[TASK ${taskIndex}] Account Already Watching.`);
            }
        }
        catch(err){
            console.log("You don't have enough accounts to fulfill your request.");
            driver.close();
            updateStatus(`[TASK ${taskIndex}] Error`);
            throw("You don't have enough accounts to fulfill your request.");
        }
        finally{
            setTimeout(function(){
                console.log('End')
            },1000);
            driver.close();
        }
    }

    for (var i = 0; i< userInput.amount; i++){
        watch(accountList[i], userInput, i);
    }

    updateStatus(`Finished Watching ${userInput.amount} times.`);

}

function ebayView(e){
    e.preventDefault();
    var prodLink = document.querySelector('#ebayViewLink').value;
    var amount = document.querySelector('#amtViews').value;    
    var userInput = {
        productUrl: prodLink,
        amount: amount
    }

    function updateStatus(message){
        viewStatus.textContent = message;
    }

    async function addView(userInput, taskIndex){
        updateStatus(`[TASK ${taskIndex}] Watching...`);
        request.get(userInput.productUrl).on('error', function(err){
            updateStatus(`[TASK ${taskIndex}] Error`);
            throw(err);
        });
        updateStatus(`[TASK ${taskIndex}] Successfully Watched!`);
    }

    for (var i = 0;i < userInput.amount; i++){
        addView(userInput, i);
    }
    updateStatus(`Finished Viewing ${userInput.amount} times.`);
}

function ebayAccount(e){
    e.preventDefault();
    var userDomain = document.querySelector('#catchDomain').value;
    var catchAll = `@${userDomain}`;
    var password = document.querySelector('#ebayPassword').value;
    var amount = document.querySelector('#amtAccs').value;

    const userInput = {
        catchAll: catchAll,
        password: password,
        amount: amount
    }

    function updateStatus(message){
        accountStatus.textContent = message;
    }

    function getRandomName(){
        var name = "";
        var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
        var ranLength = Math.floor(Math.random() * 3) + 4;
        for (var i = 0; i < ranLength ; i++){
            name = name + characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return name;
    }

    function getRandomCatchAll(domain){
        var email = "";
        var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        var ranLength = Math.floor(Math.random() * 9) + 4;
        for (var i = 0; i < ranLength ; i++){
            email = email + characters.charAt(Math.floor(Math.random() * characters.length));
        }
        email = email + domain;
        return email;
    }

    async function createAccount(userInput, taskIndex){
        updateStatus(`[TASK ${taskIndex}] Starting...`);
        var firstName = getRandomName();
        var lastName = getRandomName();
        var randEmail = getRandomCatchAll(userInput.catchAll);
        const driver = await new Builder().forBrowser('chrome').setChromeOptions(new chrome.Options().headless()).build();
        try {
            await driver.get('https://reg.ebay.com/reg/PartialReg?ru=https%3A%2F%2Fwww.ebay.com%2F');
            updateStatus(`[TASK ${taskIndex}] Sending User Data...`);
            driver.findElement(By.name('firstname')).sendKeys(firstName, Key.RETURN);
            await driver.findElement(By.name('lastname')).sendKeys(lastName);
            await driver.findElement(By.name('email')).sendKeys(randEmail);
            await driver.findElement(By.name('PASSWORD')).sendKeys(userInput.password);
            let by = By.id('ppaFormSbtBtn');
            let el = driver.findElement(by);            
            await driver.wait(until.elementIsEnabled(el), 10000, 'Error submit button is not enabled');
            await driver.findElement(By.id('ppaFormSbtBtn')).click();
            updateStatus(`[TASK ${taskIndex}] Account Successfully Created`);
            
        } finally {
            let userData = `\n${randEmail}:${password}`;
            var account = {
                username: randEmail,
                password: password
            }
            console.log(account);
            var tempList = settings.get('accountList');
            tempList.push(account);
            console.log(tempList);
            updateStatus(`[TASK ${taskIndex}] Saving Account...`);
            settings.set('accountList', tempList);
            console.log(settings.get('accountList'));
            driver.quit();
            updateStatus(`[TASK ${taskIndex}] Successfully Saved Account.`)
        }
    }  
    for (var i = 0 ; i < userInput.amount; i++){
        createAccount(userInput, i);
    }

    updateStatus(`Finished Creating ${userInput.amount} Accounts.`);
}
