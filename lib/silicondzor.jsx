import React from 'react';
import BigCalendar from 'react-big-calendar';
import moment_timezone from 'moment-timezone';
import Modal from 'react-modal';
import Routes from './routes';
import results from './replies';

moment_timezone.tz.setDefault('Asia/Yerevan');

BigCalendar.momentLocalizer(moment_timezone);

const { Component } = React;

const request_opts = body => {
  return {
    method:'post',
    headers: new Headers({
      'content-type':'application/json'
    }),
    body
  };
};

const modal_s = {
  overlay: {
    position:'fixed',
    top:'15vh',
    left:'20vw',
    right:'20vw',
    bottom:'35vh'
  },
  content:{ }
};

const close_btn_s = {
  position:'absolute',
  top:'0.25em',
  right:'0.25em',
  fontSize:'large',
  width:'10px',
  cursor:'pointer'
};

const default_scroll_time = new Date(1970, 1, 1, 4);

class Login extends Component {

  state = {
    username: '',
    password:'',
    email_valid: false,
    top_prompt_message:
    `Login so that you can add tech events,
do not use anything serious for your password.`
  };

  form_action = (register_account, e) => {
    e.preventDefault();
    if (this.state.email_valid == false) {
      if (!this.state.top_prompt_message.endsWith('Need to use a valid email address')) {
	this.state.top_prompt_message += 'Need to use a valid email address';
	this.setState(this.state);
      }
      return;
    }
    const query =
          register_account ? Routes.new_account : Routes.sign_in;
    const opts =
	  request_opts(JSON.stringify({username:this.state.username,
				       password: this.state.password}));

    fetch(query, opts)
      .then(resp => resp.json())
      .then(answer => {
	if (answer.result === results.success) {
	  this.props.close_modal();
	} else if (answer.result === results.failure) {
	  const s = this.state;
	  if (answer.reason === results.invalid_email ||
	      answer.reason === results.invalid_username_already_picked ||
	      answer.reason === results.invalid_credentials) {
	    s.top_prompt_message = answer.reason;
	    this.setState(s);
	  } else {
	    console.error(`Unknown reply: ${JSON.stringify(answer)}`);
	  }
	} else {
	  console.error(`Completely unknown answer ${JSON.stringify(answer)}`);
	}
      })
      .catch(oops => console.error(oops));
  };

  username_changed = e => {
    const s = this.state;
    s.username = e.target.value;
    // Returns true if the element's value
    // has no validity problems; false otherwise.
    s.email_valid = e.target.validity.valid;
    this.setState(s);
  }

  render () {
    const form_s = {
      display:'flex',
      flexDirection:'column'
    };
    const message_color = {
      backgroundColor:''
    };
    return (
      <form className={'login-form'}>
	<div>
	  <p style={close_btn_s} onClick={_ => this.props.close_modal()}> x </p>
          <p style={{textAlign:'center'}}> {this.state.top_prompt_message} </p>
	</div>
        <hr/>
        <div style={form_s} className={'modal-inputs'}>
          <label>Username</label>
          <input type={'email'}
                 value={this.state.username}
                 placeholder={'must be an email address'}
                 onChange={this.username_changed}
                 />
          <label>Password</label>
          <input type={'password'}
                 placeholder={'not a serious password'}
                 value={this.state.password}
                 onChange={e =>
            this.setState({...this.state, password:e.target.value})}
            />
            <input type={'button'}
                   onClick={this.form_action.bind(this, true)}
                   value={'Register an account'}/>
            <input type={'submit'}
                   onClick={this.form_action.bind(this, false)}
                   value={'Sign in'}/>
        </div>
      </form>
    );
  }
};

class Banner extends Component {

  state = {open:false}

  static defaultProps = {
    header_s: {
      minHeight: '20vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#ff5e12'
    }
  }

  login_handler = e => {
    this.setState({open:!this.state.open});
  }

  // request_close = e => this.setState({open:!this.state.open});

  render () {
    const login_s = {
      cursor:'pointer',
      textDecoration:'underline'
    };

    return (
      <div>
        <header style={this.props.header_s}>
          <h1 style={{paddingRight:'2rem'}}>
            Silicondzor
          </h1>
          <div>
            <p>
              All the tech events in Armenia  🇦🇲
            </p>
            <p>
              <span onClick={this.login_handler}
                    style={login_s}> Login</span> so that you can add your own
            </p>
            <Modal
              style={modal_s}
	      contentLabel={'Some simple test'}
              isOpen={this.state.open}>
              <Login close_modal={() => this.setState({open:false})}/>
            </Modal>
          </div>
        </header>
      </div>
    );
  }
};

class TechEvent extends Component {

  state = {
    event_title:'',
    event_description:''
  }

  submit_event = e => {
    e.preventDefault();
    this.props.submit_event({
      ...this.state,
      start:this.props.start,
      end:this.props.end
    });
  }

  render() {
    const tech_s = {
      display:'flex',
      flexDirection:'column'
    };
    const centered = { textAlign:'center'};
    return (
      <div>
	<form>
	  <p style={close_btn_s} onClick={_ => this.props.close_modal()}> x </p>
	  {this.props.prompt_msg(this.props.start, this.props.end)}
	  <hr/>
	  <div style={tech_s} className={'modal-inputs'}>
	    <label> Event title </label>
	    <input type={'text'}
		   value={this.state.event_title}
		   onChange={e =>
	      this.setState({...this.state, event_title:e.target.value})}/>
	      <label> Event Description </label>
	      <textarea type={'text'}
			rows={8}
			value={this.state.event_description}
			onChange={e =>
		this.setState({...this.state, event_description:e.target.value})}/>
		<input type={'submit'}
		       value={'Create Event'}
		       onClick={this.submit_event}/>
	  </div>
	</form>
      </div>
    );
  }
};

class TechCalendar extends Component {

  state = {
    events: [],
    modal_show: false,
    allDay:false,
    start_date: new Date,
    end_date: new Date,
    prompt_message: (start, end) => {
      const centered = { textAlign:'center'};
      return (
	<div>
	  <p style={centered}> Tech event from: </p>
	  <p style={centered}> {start.toLocaleString()} </p>
	  <p style={centered}> to </p>
	  <p style={centered}> {end.toLocaleString()} </p>
	  <br/>
	</div>
      );
    }
  }

  static defaultProps = {
    tech_calendar_s: {
      minHeight: '80vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }

  componentDidMount() {
    window.__ALL_TECH_EVENTS__ =
      window.__ALL_TECH_EVENTS__.map(event => {
        const start = new Date(event.start);
        const end = new Date(event.end);
	      return {...event, start, end };
      });
    this.setState({...this.state, events: window.__ALL_TECH_EVENTS__});
  }

  selectedDate = e => {
    const s = this.state;
    if (e.start === e.end) s.allDay = true;
    s.start_date = new Date(e.start);
    s.end_date = new Date(e.end);
    s.modal_show = true;
    this.setState(s);
  }

  submit_event = event_details => {
    fetch(Routes.add_tech_event,
	  request_opts(JSON.stringify(event_details)))
      .then(resp => resp.json())
      .then(resp => {
	if (resp.result === 'failure') {
	  const s = this.state;
	  s.prompt_message = (_, __) => {
	    const style_em = {
	      textAlign:'center',
	      fontStyle:'italic'
	    };
	    return (
	      <div>
		<p style={style_em}>Could not create an event</p>
		<p style={style_em}>{resp.reason}</p>
		<br/>
	      </div>
	    );
	  };
	  console.error(`Could not submit event: ${resp.reason}`);
	  this.setState(s);
	} else {
	  const s = this.state;
    const start = new Date(event_details.start);
    const end = new Date(event_details.end);
	  window.__ALL_TECH_EVENTS__.push({
	    allDay:event_details.start === event_details.end,
	    title:event_details.event_title,
	    start,
	    desc:event_details.event_description,
	    end
	  });
	  s.events = window.__ALL_TECH_EVENTS__;
	  s.modal_show = false;
	  this.setState(s);
	}
      });
  }

  render () {
    const s = {
      backgroundColor:'white',
      minHeight:'80vh',
      minWidth:'100%',
      zIndex:this.props.z_value
    };
    return (
      <div style={this.props.tech_calendar_s}>
        <BigCalendar
          selectable
          style={s}
          scrollToTime={default_scroll_time}
          popup={true}
          timeslots={1}
          components={{
            event:Eventbyline,
            agenda:{event:EventAgenda}
          }}
          onSelectSlot={this.selectedDate}
          events={this.state.events}
          />
	<Modal
	  style={modal_s}
	  contentLabel={'Select dates'}
	  isOpen={this.state.modal_show}>
	  <TechEvent
	    submit_event={this.submit_event}
	    close_modal={() => {
	      const s = this.state;
	      s.modal_show = false;
	      this.setState(s);
	    }}
	    prompt_msg={(start, end) => this.state.prompt_message(start, end)}
	    start={this.state.start_date}
	    end={this.state.end_date}/>
	</Modal>
      </div>
    );
  }
};

function Eventbyline({event}) {
  return (
    <span>
      {event
        .title
        .split('/')
      .map((i, idx) => <p key={idx}> {i} </p>)}
      <br/>
      <p style={{paddingLeft:'1rem'}}> Being held by {event.sourced_from} </p>
    </span>
  );
};

class AgendaNote extends Component {

  static langs = ['EN', 'RU', 'HYE'];
  static colors = ['red', 'blue', 'orange']

  render() {
    return (
      <div>
        {this
          .props
          .event
          .title
          .split('/')
          .map((i, idx) => {
            return (
              <p key={idx} style={{
                   textAlign:'center',
                   color:'white',
                   backgroundColor:AgendaNote.colors[idx]
                   }}>
                {AgendaNote.langs[idx]} = {i}
              </p>
            );
          })
        }
        <p style={{fontStyle:'italic', marginTop:'0.5rem'}}>
        Hosted by {this.props.event.sourced_from}{' '}
        <a href={this.props.event.url}>details</a>
      </p>
        <hr style={{borderWidth:'0.1rem', borderColor:'black'}}/>
        <p style={{marginTop:'1rem',
                   textIndent:'2rem',
                   boxShadow: 'inset 0 0 10px #000000',
                   padding:'1.5em 1.5em 1.5em 1.5em',
                   marginBottom:'1rem'}}> {this.props.event.desc} </p>
      </div>
    );
  }
};

function EventAgenda({event}) {
  return <AgendaNote event={event}/>;
}


export default
class _ extends Component {

  state = {calendar_z_value: '0'}

  render () {

    return (
      <div>
        <Banner push_calendar={should_push => {
            if (should_push) {
              this.setState({calendar_z_value:'-100'});
            } else {
              this.setState({calendar_z_value:'0'});
            }
          }}/>
          <TechCalendar z_value={this.state.calendar_z_value}/>
      </div>
    );
  }
};
