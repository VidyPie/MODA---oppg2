function load() {
    clearAdverts();
    loadAdverts();
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
 
function loadAdverts() {
    xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            this.readyState = 0;
    	    var res = JSON.parse(this.responseText);
    	    console.log(res);
    	    $.each(res, function (i) {
    	        insertAdvert(res[i]);
    	        return;
        	});
        }
    };
    xhttp.open('GET', 'http://vidypie.com/fant/php/getadverts.php', true);
    xhttp.send();
}

async function insertAdvert(res) {
    var w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    var div = document.createElement('div');
    div.style.width = (w / 4 - 50).toString() + 'px';
    div.className = 'contentbox';
    div.style.opacity = 0;
    createParagraph(div, res.TITLE).className = 'title';
    var img = document.createElement('img');
    img.src = res.IMAGE;
    div.appendChild(img);
    img.style['max-width'] = (w / 4 - 70).toString() + 'px';
    document.getElementById('content').appendChild(div);
    div.title = res.TITLE;
    div.text = res.TEXT;
    div.image = res.IMAGE;
    div.username = res.USERNAME;
    await sleep(250);
    div.style.height = (img.height + 70).toString() + 'px';
    div.style.opacity = 1;
    div.addEventListener('click', showAdvert);
}

async function showAdvert(event) {
    if ($('.showBox').length > 0)
        return;
    addModal();
    var div = document.createElement('div');
    div.className = 'showBox';
    var target = event.target;
    if (target.tagName === 'IMG' || target.tagName === 'p' || target.tagName === 'P')
        target = target.parentElement;
    createParagraph(div, target.title).className = 'stitle';
    var img = document.createElement('img');
    img.src = target.image;
    div.appendChild(img);
    createParagraph(div, target.text).className = 'showTxt';
    createParagraph(div, 'Opprettet av ' + target.username).className = 'postedBy';
    div.style.opacity = 0;
    document.body.appendChild(div);
    var w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    var h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
    img.style['max-width'] = (w * 0.6 - 40).toString() + 'px';
    img.style['max-height'] = (h * 0.6 - 20).toString() + 'px';
    await sleep(250);
    div.style.opacity = 1;
}

function clearAdverts() {
    $('#content').empty();
}

function createParagraph(parent, txt) {
    var p = document.createElement('p');
    var pText = document.createTextNode(txt);
    p.appendChild(pText);
    parent.appendChild(p);
    return p;
}

function addInput(form, type, name, placeholder) {
    var input = document.createElement('input');
    input.type = type;
    input.name = name;
    input.placeholder = placeholder;
    form.appendChild(input);  
    return input;
}

function openLogin() {
    if ($('.loginBox').length > 0)
        return;
    addModal();
    var div = document.createElement('div');
    div.className = 'loginBox';
    var form = document.createElement('form');
    addInput(form, 'text', 'username', 'Brukernavn');
    addInput(form, 'password', 'password', 'Passord');
    var submit = document.createElement('input');
    submit.type = 'submit';
    submit.value = 'Logg inn';
    form.appendChild(submit);
    div.appendChild(form);
    document.body.appendChild(div);
    $('.loginBox').submit(function (a, b) {
         tryLogin($('.loginBox form').serialize());
         return false;
        });
}

function tryLogin(data) {
    removeErrorMsg($('.loginBox')[0]);
    removeValidMsg($('.loginBox')[0]);
    xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            this.readyState = 0;
        	var res = JSON.parse(this.responseText);
        	console.log(res);
            if (res.length == 0) {
               errorMsg($('.loginBox')[0], 'Feil brukernavn eller passord.');      
            } else {
            	$.each(res, function (i) {
        	        if (res[i].valid) {
        	            validLogin(res[i]);
        	        } else {
        	            errorMsg($('.loginBox')[0], 'Feil brukernavn eller passord.');     
        	        }
        	        return;
            	});
            }
        }
    };
    xhttp.open('GET', 'http://vidypie.com/fant/php/login.php?'+data, true);
    xhttp.send();  
}

function validLogin (res) {
    $('.loginBox').remove();
    removeModal();
    window.username = res.username; 
    $('#loginBtn').hide();
    $('#userBtn').hide();
    $('#newBtn').show();
    $('#logoutBtn').show();
}

function logout() {
    window.username = ''; 
    $('#logoutBtn').hide();
    $('#loginBtn').show();
    $('#userBtn').show();
}
 
function newUser() {
    if ($('.userBox').length > 0)
        return;
    addModal();
    var div = document.createElement('div');
    div.className = 'userBox';
    var form = document.createElement('form');
    addInput(form, 'text', 'adress', 'E-post').disabled = true;
    addInput(form, 'text', 'username', 'Ønsket Brukernavn');
    addInput(form, 'password', 'password', 'Ønsket Passord');
    addInput(form, 'password', 'password2', 'Gjenta passord');
    var submit = document.createElement('input');
    submit.type = 'submit';
    submit.value = 'Opprett bruker';
    form.appendChild(submit);
    div.appendChild(form);
    document.body.appendChild(div);
    $('.userBox').submit(function (a, b) {
        clearNewUserErrorMarking();
        if (checkNewUserFormValues()) {
            tryNewUser($('.userBox form').serialize());
        }
        return false;
        });
}

function clearNewUserErrorMarking() {
    $('.userBox form input[name=username]').css({"background-color": "white"});
    $('.userBox form input[name=password]').css({"background-color": "white"});
    $('.userBox form input[name=password2]').css({"background-color": "white"});
    removeErrorMsg($('.userBox')[0]);
}

function checkNewUserFormValues() {
    var check = true;
    var username = $('.userBox form input[name=username]');
    if (username[0].value === '' || username[0].value.length < 5) {
        errorMsg($('.userBox')[0], 'Brukernavnet er for kort. Må være 5 tegn eller mer.');
        username.css({"background-color": "#ff5757"});
        check = false;
    }
    var pw = $('.userBox form input[name=password]'); 
    var pw2 = $('.userBox form input[name=password2]'); 
    if (pw[0].value === '' || pw[0].value.length < 5) {
        pw.css({"background-color": "#ff5757"});
        errorMsg($('.userBox')[0], 'Passordet er for kort. Må være 5 tegn eller mer.');
        check = false;
    }
    if (pw2[0].value === '' || pw2[0].value.length < 5) {
        pw2.css({"background-color": "#ff5757"});
        errorMsg($('.userBox')[0], 'Passordet er for kort. Må være 5 tegn eller mer.');
        check = false;
    }
    if (pw[0].value !== pw2[0].value && check) {
        pw.css({"background-color": "#ff5757"});
        pw2.css({"background-color": "#ff5757"});
        errorMsg($('.userBox')[0], 'Passordene er ikke like.');
        check = false;
    }
    return check;
}

function tryNewUser(data) {
    xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            this.readyState = 0;
        	var res = JSON.parse(this.responseText);
        	$.each(res, function (i) {
    	        if (res[i].valid) {
    	            newValidUser();
    	            return;
    	        } else if (res[i].dupUser) {
    	            errorMsg($('.userBox')[0], 'Dette brukernavnet er allerede i bruk. Vennligst velg et annet brukernavn.');
    	            return;
    	        } 
        	});
        }
    };
    xhttp.open('GET', 'http://vidypie.com/fant/php/newuser.php?'+data, true);
    xhttp.send();  
}

function newValidUser() {
    $('.userBox').remove();
    openLogin();
    validMsg($('.loginBox')[0], 'Vellykket oppretting av bruker. Du kan nå logge inn.');
}

function errorMsg(box, msg) {
    var error = $(box).find('.errortxt')[0];
    if (error) {
        return;
    }
    var p = document.createElement('p');
    p.className = 'errortxt';
    p.textContent = msg;
    box.appendChild(p);
    $(box).css({'height': $(box).height() + $(p).height() + 20});
}

function removeErrorMsg(box) {
    var error = $(box).find('.errortxt')[0];
    if (error) {
        $(box).css({'height': $(box).height() - $(error).height() - 20}); 
        $(error).remove();
    }
}

function validMsg(box, msg) {
    var info = $(box).find('.infotxt')[0];
    if (info) {
        return;
    }
    var p = document.createElement('p');
    p.className = 'infotxt';
    p.textContent = msg;
    box.appendChild(p);
    $(box).css({'height': $(box).height() + $(p).height() + 20});
}

function removeValidMsg(box) {
    var info = $(box).find('.infotxt')[0];
    if (info) {
        $(box).css({'height': $(box).height() - $(info).height() - 20}); 
        $(info).remove();
    }
}

function newAdvert() {
    if ($('.editBox').length > 0)
        return;
    addModal();
    var div = document.createElement('div');
    div.className = 'editBox';
    createParagraph(div, 'Ny annonse').className = 'title';
    var form = document.createElement('form');
    addInput(form, 'text', 'title', 'Tittel');
    addInput(form, 'text', 'uri', 'Bildelink');
    var textArea = document.createElement('textarea');
    textArea.name = 'txt';
    textArea.rows = '10';
    textArea.cols = '30';
    form.appendChild(textArea);
    var submit = document.createElement('input');
    submit.type = 'submit';
    submit.value = 'Lag annonse';
    form.appendChild(submit);
    div.appendChild(form);
    document.body.appendChild(div);
    $('.editBox').submit(function (a, b) {
        clearNewAdvertErrorMarking();
        if (checkNewAdvertFormValues()) {
            tryNewAdvert($('.editBox form').serialize());
        }
        return false;
        });
}

function checkNewAdvertFormValues() {
    var check = true;
    var title = $('.editBox form input[name=title]');
    if (title[0].value === '' || title[0].value.length < 5) {
        errorMsg($('.editBox')[0], 'Tittelen er for kort. Må være 5 tegn eller mer.');
        title.css({"background-color": "#ff5757"});
        check = false;
    }
    var uri = $('.editBox form input[name=uri]'); 
    if (uri[0].value === '') {
        uri.css({"background-color": "#ff5757"});
        errorMsg($('.editBox')[0], 'Du må linke til et bilde som skal vise på annonsen.');
        check = false;
    }
    return check;
}

function clearNewAdvertErrorMarking() {
    $('.editBox form input[name=title]').css({"background-color": "white"});
    $('.editBox form input[name=uri]').css({"background-color": "white"});
    removeErrorMsg($('.editBox')[0]);
}

function tryNewAdvert(data) {
    xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            this.readyState = 0;
        	var res = JSON.parse(this.responseText);
        	$.each(res, function (i) {
    	        if (res[i].valid) {
    	            newValidAdvert();
    	            return;
    	        } else  {
    	            errorMsg($('.editBox')[0], 'Noe gikk galt under opprettingen av ny annonse. Vennligst prøv igjen.');
    	            return;
    	        } 
        	});
        }
    };
    xhttp.open('GET', 'http://vidypie.com/fant/php/newadvert.php?'+data+'&username='+window.username, true);
    xhttp.send();  
}

function newValidAdvert() {
    $('.editBox').remove();
    removeModal();
    load();
}

function addModal() {
    var div = document.createElement('div');
    div.className = 'modal';
    div.addEventListener('click', removeModal);
    document.body.appendChild(div);
}

function removeModal() {
    $('.modal').remove();
    $('.loginBox').remove();
    $('.showBox').remove();
    $('.userBox').remove();
    $('.editBox').remove();
}
