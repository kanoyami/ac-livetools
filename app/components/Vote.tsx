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
import VoteOption from '../class/VoteOption';

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

export default class Vote extends React.Component<any, any> {
  uid = '';

  content = '';

  start = false;

  interval: any;

  constructor(props: Props<never>) {
    super(props);
    this.state = {
      tips: '未连接',
      danmakuArr: [],
      startTime: '',
      endTime: '',
      buttonState: false,
      voteOptions: [],
      voteNameNow: '',
    };
  }

  arrCompose = (arr: Danmaku[]) => {
    const userArr: Danmaku[] = [];
    for (let index = 0; index < arr.length; index += 1) {
      const danmaku = arr[index];
      if (userArr.length === 0) {
        userArr.push(danmaku);
        const flag = this.isContent(danmaku.content);
        if (flag !== 'none') {
          const { voteOptions } = this.state;
          voteOptions[flag].votes += 1;
          this.setState({ voteOptions });
        }
      }
      for (let n = 0; n < userArr.length; n += 1) {
        if (
          danmaku.userInfo.userId.toString() ===
          userArr[n].userInfo.userId.toString()
        )
          break;
        else {
          const flag = this.isContent(danmaku.content);
          if (flag !== 'none') {
            userArr.push(danmaku);
            const { voteOptions } = this.state;
            voteOptions[flag].votes += 1;
            this.setState({ voteOptions });
          }
        }
      }
    }
    clearInterval(this.interval);
  };

  handleAddOptions = () => {
    const voteOption = new VoteOption(
      this.state.voteOptions.length,
      this.state.voteNameNow
    );
    const { voteOptions } = this.state;
    voteOptions.push(voteOption);
    this.setState({ voteOptions, voteNameNow: '' });
  };

  handleDeleteOptions = () => {
    const { voteOptions } = this.state;
    voteOptions.splice(-1);
    this.setState({ voteOptions });
  };

  handleVoteName = (e: { currentTarget: { value: string } }) => {
    this.setState({ voteNameNow: e.currentTarget.value });
  };

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

  isContent = (content: string) => {
    for (let index = 0; index < this.state.voteOptions.length; index += 1) {
      const element: VoteOption = this.state.voteOptions[index];
      if (content === element.type.toString()) return element.type;
    }
    return 'none';
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
        this.arrCompose(this.state.danmakuArr);
        this.setState({ buttonState: false });
      }
      console.log('runing');
    }, 1000);
  };

  handleConnect = () => {
    acClient(this.uid)
      .then((ac_client: any) => {
        ac_client.wsStart();
        ac_client.on('enter', () => {
          this.setState({ tips: '已连接' });
        });
        ac_client.on('danmaku', (danmaku: Danmaku) => {
          if (this.start && this.isContent(danmaku.content) !== 'none') {
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
        <div>{this.state.tips}</div>
        <br />
        <TextField
          onChange={this.handleVoteName}
          id="standard-basic"
          label="投票选项名称"
          value={this.state.voteNameNow}
        />
        <Button
          disabled={this.state.buttonState}
          variant="contained"
          onClick={() => {
            this.handleAddOptions();
          }}
          color="primary"
        >
          添加投票项
        </Button>
        <Button
          disabled={this.state.buttonState}
          variant="contained"
          onClick={() => {
            this.handleDeleteOptions();
          }}
          color="secondary"
        >
          删除投票项
        </Button>
        <br />
        <table>
          <thead>
            <tr>
              <th>id</th>
              <th>名称</th>
              <th>票数</th>
            </tr>
          </thead>
          <tbody>
            {this.state.voteOptions.map((element: VoteOption) => {
              return (
                <tr key={element.type}>
                  <td>{element.type}</td>
                  <td>{element.voteName}</td>
                  <td>{element.votes}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <br />
        <br />
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

        <div style={{ overflowY: 'scroll', width: '100%', height: '400px' }}>
          <table>
            <thead>
              <tr>
                <th>时间</th>
                <th>昵称</th>
                <th>uid</th>
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
