class Chat {
  constructor(room_key, user, id_contenedor, database) {
    this.id = room_key;
    this.user = user;
    this.database = database;
    this.build_chat(id_contenedor);
    this.bind_events();
  }

  build_chat(id_contenedor) {
    this.template = $.tmpl($('#template'), {id: this.id});
    this.template.appendTo($(`#${id_contenedor}`));
    this.ref = this.database.ref('/messages/' + this.id);
  }

  bind_events() {
    this.template.find('form').on('submit', (ev) => {
      ev.preventDefault();

      let mensaje = $(ev.target).find('.message-content').val();

      if (mensaje.trim().length > 0) this.send(mensaje);
      $(ev.target).find('.message-content').val('');

      return false;
    });

    this.ref.on('child_added', (data) => {
      this.add(data);
    });
  }

  add(data) {
    let html = `<b>${data.val().name}: </b>
                <span>${data.val().message}</span>`;

    let $mensaje = $('<li>')
                      .addClass('collection-item')
                      .html(html);

    this.template.find('.messages').append($mensaje);
  }

  send(mensaje) {
    this.ref.push({
      name: this.user.displayName || this.user.email,
      room_id: this.id,
      message: mensaje
    });
  }
}
