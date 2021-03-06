import React, { Component } from 'react'
import { Route, Router, Redirect, Switch } from 'react-router-dom'
import ReactGA from 'react-ga'
import createHistory from 'history/createBrowserHistory'

import Home from './Home'
import Intro from './Intro'
import DashboardContainer from '../containers/Dashboard'
import Level from './Level'
import ChoicesContainer from '../containers/Choices'
import SubmitContainer from '../containers/Submit'
import User from './User'
import Done from './Done'
import { firebaseAuth, database } from '../config/constants'
import { saveUser, logout } from '../helpers/auth'

// Google Analytics
ReactGA.initialize('')
const history = createHistory()
  history.listen((location) => {
  ReactGA.set({ page: location.pathname })
  ReactGA.pageview(location.pathname)
});

export default class App extends Component {
  constructor(props) {
    super(props)

    this.state = {
      authed: false,
      loading: true,
      user: {},
      gameSession: 1,
    }
  }

  componentDidMount() {
    this.removeListener = firebaseAuth().onAuthStateChanged(user => this.updateAuthState(user))
  }

  componentWillUnmount() {
    this.removeListener()
  }

  getGameId(user) {
    const db = database.app.database()
    const ref = db.ref(`users/${user.uid}/games`)
    let numberOfGames

    ref.once('value')
      .then((snapshot) => {
        numberOfGames = Number(snapshot.numChildren())
        console.log('gameId', numberOfGames + 1)

        this.setState({
          gameSession: numberOfGames + 1,
        })
      })
  }

  updateAuthState(user) {
    if (user) {
      saveUser(user)
      this.getGameId(user)

      this.setState({
        authed: true,
        loading: false,
        user,
      })
    } else {
      this.setState({
        loading: false,
      })
    }
  }

  handleLogout() {
    const warning = confirm('Are you sure you want to log out?')
    if (warning) {
      console.log("LOGGED OUT")
      logout()
      this.setState({ authed: false })
    }
  }

  render() {
    return this.state.loading === true ? <h1>Loading</h1> : (
      <Router history={history}>
        <div className="container">
          <div className="row">
            <Switch>
              <Route path="/" exact render={() => {
                return this.state.authed
                ? <Redirect to="/intro/1" />
                : <Home />
              }} />
              <Route path="/login" user={this.state.user} render={(props) => {
                return this.state.authed
                ? <Redirect to="/intro/1" />
                : <Home {...props} />
              }} />
              <Route path='/intro/:id' render={ props => {
                return <Intro {...props} authed={this.state.authed}
                  handleLogout={this.handleLogout.bind(this)}
                />
              }} />
              <Route path='/dashboard' render={ props => {
                return <DashboardContainer isAuthed={this.state.authed}
                  handleLogout={this.handleLogout.bind(this)}
                />
              }} />
              <Route exact path='/level/:id' render={props => {
                return <Level {...props} isAuthed={this.state.authed}
                  handleLogout={this.handleLogout.bind(this)}
                />
              }} />
              <Route path="/level/:level_id/choices" render={(props) => {
                return (
                  <ChoicesContainer {...props} user={this.state.user}
                    isAuthed={this.state.authed}
                    gameId={this.state.gameSession}
                    handleLogout={this.handleLogout.bind(this)}
                  />
                )
              }} />
              <Route path="/submit" render={(props) => {
                return (
                  <SubmitContainer user={this.state.user} {...props}
                    gameId={this.state.gameSession}
                    isAuthed={this.state.authed}
                    handleLogout={this.handleLogout.bind(this)}
                  />
                )
              }} />
              <Route path="/user" render={(props) => {
                return (
                  <User user={this.state.user} isAuthed={this.state.authed}
                    handleLogout={this.handleLogout.bind(this)}
                  />
                )
              }} />
              <Route path="/done" render={(props) => {
                return <Done {...props} />
              }} />
              <Route render={() => <h3>Oops, you went off the tracks.</h3>} />
            </Switch>
          </div>
        </div>
      </Router>
    );
  }
}
