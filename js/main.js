(function() {
  // Initialize Firebase
  let config = {
    apiKey: "AIzaSyCWPND_r-cdNXIAJ2xK_6tuTLGkYNKMX9Y",
    authDomain: "taller-firebase-cf-45be9.firebaseapp.com",
    databaseURL: "https://taller-firebase-cf-45be9.firebaseio.com",
    storageBucket: "",
  };

  firebase.initializeApp(config);

  // Database
  let database = firebase.database();
  let usuariosConectados = database.ref('/connected');
  let roomsReferencia = database.ref('/rooms');

  // User
  let user = null;
  let key_conectado = '';
  let loginBtn = document.getElementById('start-login');

  // Events
  loginBtn.addEventListener('click', google_login);
  window.addEventListener('unload', unlogin);

  // Functions
  function google_login() {
    let provider = new firebase.auth.GoogleAuthProvider();

    firebase.auth().signInWithPopup(provider)
      .then(function(result) {
        user = result.user;
        $('#login').fadeOut();
        init_app();
      });
  }

  function init_app() {
    login(user.uid, user.displayName || user.email);
    usuariosConectados.on('child_added', add_user);
    usuariosConectados.on('child_removed', hide_user);
    roomsReferencia.on('child_added', evaluate_room);
  }

  function evaluate_room(data) {
    if (data.val().friend === user.uid) {
      new Chat(data.key, user, 'chats', database);
    }
  }

  function add_user(data) {
    if (data.val().uid === user.uid) return;
    let $li = $('<li>')
                .addClass('collection-item')
                .html(data.val().displayName)
                .attr('id', data.val().uid)
                .attr('data-key', data.key);

    $li.on('click', function() {
      let friend_uid = $(this).attr('id');
      let room = roomsReferencia.push({
        creator: user.uid,
        friend: friend_uid
      });

      new Chat(room.key, user, 'chats', database);
    });

    $('#users').append($li);
  }

  function hide_user(data) {
    $(`#${data.val().uid}`)
      .slideUp()
      .remove();
  }

  function login(uid, displayName) {
    let conectado = usuariosConectados.push({
      uid: uid,
      displayName: displayName
    });

    key_conectado = conectado.key;
  }

  function unlogin() {
    database.ref('/connected/' + key_conectado).remove();
  }
})();
