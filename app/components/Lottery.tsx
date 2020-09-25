/* eslint-disable react/jsx-one-expression-per-line */
/* eslint-disable react/no-access-state-in-setstate */
/* eslint-disable react/destructuring-assignment */
/* eslint-disable no-console */
import React, { Props } from 'react';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import acClient from 'ac-danmu';
import moment from 'moment';
import Long from 'long';

interface Danmaku {
  content: string;
  sendTimeMs: Long;
  userInfo: UserInfo;
}

interface UserInfo {
  userId: Long;
  nickname: string;
  badge: string;
}

function arrCompose(arr: Danmaku[]) {
  const userArr: UserInfo[] = [];
  console.log(arr.length);
  for (let index = 0; index < arr.length; index += 1) {
    const danmaku = arr[index];
    console.log(userArr.length);
    console.log(danmaku.userInfo);
    if (userArr.length === 0) userArr.push(danmaku.userInfo);
    for (let n = 0; n < userArr.length; n += 1) {
      if (danmaku.userInfo.userId.toString() === userArr[n].userId.toString())
        break;
      else userArr.push(danmaku.userInfo);
    }
  }
  return userArr;
}

export default class Lottery extends React.Component<any, any> {
  uid = '';

  content = '';

  start = false;

  interval: any;

  constructor(props: Props<never>) {
    super(props);
    this.state = {
      tips: '未连接',
      danmakuArr: [],
      winner: null,
      startTime: '',
      endTime: '',
      buttonState: false,
    };
  }

  handleUidInput = (e: { currentTarget: { value: string } }) => {
    this.uid = e.currentTarget.value;
  };

  handleContentInput = (e: { currentTarget: { value: string } }) => {
    this.content = e.currentTarget.value;
  };

  handleStartTimeChange = (e: { currentTarget: { value: string } }) => {
    this.setState({ startTime: e.currentTarget.value });
  };

  handleEndTimeChange = (e: { currentTarget: { value: string } }) => {
    this.setState({ endTime: e.currentTarget.value });
  };

  handleStart = () => {
    const start: string = this.state.startTime;
    const end: string = this.state.endTime;
    this.setState({ buttonState: true });
    this.interval = setInterval(() => {
      if (moment().format('hh:mm') === moment(start).format('hh:mm')) {
        this.start = true;
      }
      if (moment().isAfter(end)) {
        this.handleLottery();
      }
      console.log('runing');
    }, 1000);
  };

  handleLottery = () => {
    this.start = false;
    const lotteries = arrCompose(this.state.danmakuArr);
    console.log(lotteries);
    const n = Math.floor((Math.random() * 1000000) % lotteries.length);
    clearInterval(this.interval);
    this.setState({ winner: lotteries[n], buttonState: false });
  };

  handleConnect = () => {
    acClient(this.uid)
      .then((ac_client: any) => {
        ac_client.wsStart();
        ac_client.on('enter', () => {
          this.setState({ tips: '已连接' });
        });
        ac_client.on('danmaku', (danmaku: Danmaku) => {
          if (this.start) {
            // && danmaku.content === this.content) {
            const a: Danmaku[] = this.state.danmakuArr;
            a.push(danmaku);
            this.setState({ danmakuArr: a });
          }
        });

        return 1;
      })
      .catch((e: Error) => {
        console.error(e);
      });
  };

  render() {
    return (
      <form noValidate autoComplete="off">
        <TextField
          onChange={this.handleUidInput}
          id="standard-basic"
          label="直播间号"
        />
        <Button
          variant="contained"
          color="primary"
          onClick={this.handleConnect}
        >
          连接
        </Button>
        <br />
        <TextField
          onChange={this.handleContentInput}
          id="standard-basic"
          label="抽奖文字"
        />

        <TextField
          disabled={this.state.buttonState}
          id="datetime-local-1"
          label="开始时间"
          type="datetime-local"
          defaultValue={moment().format('yyyy-MM-DDTHH:mm')}
          InputLabelProps={{
            shrink: true,
          }}
          onChange={this.handleStartTimeChange}
        />

        <TextField
          disabled={this.state.buttonState}
          id="datetime-local"
          label="结束时间"
          type="datetime-local"
          defaultValue={moment().format('yyyy-MM-DDTHH:mm')}
          InputLabelProps={{
            shrink: true,
          }}
          onChange={this.handleEndTimeChange}
        />
        <Button
          disabled={this.state.buttonState}
          variant="contained"
          onClick={() => {
            this.handleStart();
          }}
          color="primary"
        >
          开始
        </Button>
        <div>{this.state.tips}</div>
        <div>
          恭喜 :
          {this.state.winner
            ? `${
                this.state.winner.nickname
              }uid:${this.state.winner.userId.toString()}`
            : ''}
        </div>
        <div style={{ overflowY: 'scroll', width: '100%', height: '400px' }}>
          <table>
            <thead>
              <tr>
                <th>时间</th>
                <th>uid</th>
                <th>昵称</th>
                <th>内容</th>
              </tr>
            </thead>
            <tbody>
              {this.state.danmakuArr.map((element: Danmaku) => {
                return (
                  <tr key={element.sendTimeMs.toString()}>
                    <td>
                      {moment(element.sendTimeMs.toNumber()).format('hh:mm:ss')}
                    </td>
                    <td>{element.userInfo.nickname}</td>
                    <td>{element.userInfo.userId.toString()}</td>
                    <td>{element.content}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </form>
    );
  }
}
