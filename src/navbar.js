import React from 'react'

class Navbar extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      username: '',
      admin: false,
      urls: {},
    }
  }

  links() {
    return [
      {
        name: 'about',
        url: "https://github.com/mgax/hoover"
      },
      {
        name: 'documentation',
        url: "https://dl.dropboxusercontent.com/u/103063/static/hoover/HooverDocumentaiton.pdf"
      },
      {
        name: 'terms',
        url: "/terms.html"
      },
      {
        name: 'login',
        url: this.state.urls.login,
        type: 'not-logged-in'
      },
      {
        name: '(' + this.state.username + ') logout',
        url: this.state.urls.logout,
        type: 'logged-in'
      },
      {
        name: 'change password',
        url: this.state.urls.password_change,
        type: 'logged-in'
      },
      {
        name: 'admin',
        url: this.state.urls.admin,
        type: 'admin'
      }
    ]
  }

  shouldShow(link) {
    if (link.type == 'admin') {
      return this.state.admin
    }
    if (link.type == 'logged-in') {
      return this.state.username
    }
    if (link.type == 'not-logged-in') {
      return !this.state.username
    }
    return true
  }

  componentDidMount() {
    $.get('/whoami', function (me) {
      this.setState(me)
    }.bind(this))
  }

  render() {
    var links = this.links().filter(this.shouldShow.bind(this)).map((l) =>
      <a className="dropdown-item" href={l.url} key={l.name}>
        {l.name}
      </a>
    )

    return (
      <span className="btn-group" role="group">
        <button id="loggedin-btngroup" type="button"
            className="btn btn-secondary dropdown-toggle"
            data-toggle="dropdown"
            aria-haspopup="true" aria-expanded="false"
          >☰</button>
        <div
          className="dropdown-menu dropdown-menu-right"
          aria-labelledby="loggedin-btngroup"
          >{links}</div>
      </span>
    )
  }
}

export default Navbar
