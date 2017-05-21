import React, { Component } from 'react';
import { observer } from "mobx-react";
import { observable, action, computed, toJS, extendObservable } from 'mobx';
import styled from 'styled-components';
import { StyledLink, ContentWrapper, NewsHeadLine,
         ByLine, BoxShadowWrap, SubmitBanner, SubmissionBox,
         TabBar, TabItem, RowField, Input, SubmissionButton,
         SubmissionContent, PostSubmission}
from './with-style';
import { request_opts } from './utility';
import routes from './http-routes';
import store from './store';

const LOGIN_TAB = 'login', REGISTER_TAB = 'register';
const all_tabs = [LOGIN_TAB, REGISTER_TAB];

const CenteredWrapper = styled(ContentWrapper)`
  display: flex;
  flex-direction: column;
  background-color: #f6f6ef;
  min-height: 0px;
  justify-content: center;
`;

const FieldName = styled.label`
  padding-right: 5px;
`;

const Login = observer(() => {
  return (
    <PostSubmission>
      <SubmitBanner>Login</SubmitBanner>
      <CenteredWrapper>

        <RowField>
          <FieldName>Username:</FieldName>
          <Input onChange={e => store.credentials.username = e.target.value}/>
        </RowField>

        <div style={{paddingTop:'5px', paddingBottom: '5px'}}/>

        <RowField>
          <FieldName>Password:</FieldName>
          <Input type={'password'}
                 onChange={e => store.credentials.username = e.target.value}/>
        </RowField>

        <SubmissionButton onClick={() => console.log('finished')}>
          Login
        </SubmissionButton>

      </CenteredWrapper>

    </PostSubmission>
  );
});

const new_user_registration = new (class {
  constructor() {
    extendObservable(this, {
      email: '', username: '', password: '', color: 'black'
    });
  }
});

const email_regex =
  /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

const register_account = () => {
  console.log(toJS(new_user_registration));
};

const not_valid = () => {
  if (email_regex.test(new_user_registration.email) === false) {
    new_user_registration.color = 'red';
  } else new_user_registration.color = 'black';
};

const Register = observer(() => {
  return (
    <PostSubmission>
      <SubmitBanner>Register a new account</SubmitBanner>
      <CenteredWrapper>
        <RowField>
          <FieldName>Email account:</FieldName>
          <Input placeholder={'hayek@armenia.com'}
                 style={{color: new_user_registration.color}}
                 onBlur={not_valid}
                 type={'email'}
                 required={true}
                 value={new_user_registration.email}
                 onChange={e => new_user_registration.email = e.target.value}/>
        </RowField>

        <div style={{paddingTop:'5px', paddingBottom: '5px'}}/>

        <RowField>
          <FieldName>Username:</FieldName>
          <Input
            value={new_user_registration.username}
            onChange={e => new_user_registration.username = e.target.value}/>
        </RowField>

        <div style={{paddingTop:'5px', paddingBottom: '5px'}}/>

        <RowField>
          <FieldName>Password:</FieldName>
          <Input type={'password'}
                 value={new_user_registration.password}
                 onChange={e => new_user_registration.password = e.target.value}/>
        </RowField>

        <SubmissionButton onClick={register_account}>
          Create Account
        </SubmissionButton>

      </CenteredWrapper>

    </PostSubmission>

  );
});

export default @observer class SDLogin extends Component {

  @observable tab_index = 1;

  @computed get tab() { return all_tabs[this.tab_index]; }

  /** User login handlers */
  @action login_password_handler =
    e => store.credentials.password = e.target.value;
  @action login_username_handler =
    e => store.credentials.username = e.target.value;

  /** Create account handlers */
  @action create_account_username_handler =
    e => this.create_account.username = e.target.value;
  @action create_account_email_handler =
    e => this.create_account.email = e.target.value;
  @action create_account_password_handler =
    e => this.create_account.password = e.target.value;

  @action do_login = async () => {
    const login_result =
          await fetch(routes.post.sign_in,
                      request_opts(toJS(this.login_creds)));
    console.log(login_result);
  };

  @action do_create_account = async () => {
    const create_account =
          await fetch(routes.post.new_account,
                      request_opts(toJS(this.create_account)));
    console.log('Create an account', create_account);
  };

  tab_select = e => this.tab_index = all_tabs.indexOf(e.target.textContent);

  render () {
    let content = null;
    if (this.tab_index === 0) content = <Login/>;
    else                      content = <Register/>;
    const tabs =
          all_tabs.map(tab => (
            <TabItem selected={tab === this.tab ? true : false}
                     onClick={this.tab_select}
                     key={tab}>{tab}</TabItem>
          ));
    return (
      <SubmissionContent>
        <SubmissionBox>
          <TabBar>{tabs}</TabBar>
          {content}
        </SubmissionBox>
      </SubmissionContent>
    );
  }
}
