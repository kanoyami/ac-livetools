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
  userInfo: {
    userId: Long;
    nickname: string;
    badge: string;
  };
}

export default class Lottery extends React.Component<any, any> {
  uid = '';

  content = '';

  start = false;

  constructor(props: Props<never>) {
    super(props);
    this.state = {
      tips: '未连接',
      danmakuArr: [],
      winner: null,
    };
  }

  handleUidInput = (e: { currentTarget: { value: string } }) => {
    this.uid = e.currentTarget.value;
  };

  handleContentInput = (e: { currentTarget: { value: string } }) => {
    this.content = e.currentTarget.value;
  };

  handleStart = () => {
    this.start = true;
  };

  handleLottery = () => {
    this.start = false;
    const n = Math.floor(
      (Math.random() * 1000000) % this.state.danmakuArr.length
    );
    console.log();
    console.log(this.state.danmakuArr[n]);
    this.setState({ winner: this.state.danmakuArr[n] });
  };

  handleConnect = () => {
    acClient(this.uid)
      .then((ac_client: any) => {
        ac_client.wsStart();
        ac_client.on('enter', () => {
          this.setState({ tips: '已连接' });
        });
        ac_client.on('danmaku', (danmaku: Danmaku) => {
          if (this.start && danmaku.content === this.content) {
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

        <TextField
          onChange={this.handleContentInput}
          id="standard-basic"
          label="抽奖文字"
        />
        <Button
          variant="contained"
          onClick={() => {
            this.handleStart();
          }}
          color="primary"
        >
          开始
        </Button>
        <Button
          variant="contained"
          onClick={() => {
            this.handleLottery();
          }}
          color="primary"
        >
          结束
        </Button>
        <div>{this.state.tips}</div>
        <div>
          恭喜:{this.state.winner ? this.state.winner.userInfo.nickname : ''}
        </div>
        <div style={{ overflowY: 'scroll', width: '100%', height: '500px' }}>
          <table>
            <thead>
              <tr>
                <th>时间</th>
                <th>uid</th>
                <th>昵称</th>
                <th>内容</th>
              </tr>
            </thead>
          </table>
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
        </div>
      </form>
    );
  }
}
