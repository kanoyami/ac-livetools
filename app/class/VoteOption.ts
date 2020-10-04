/*
 * @Date: 2020-10-04 15:20:27
 * @LastEditors: kanoyami
 * @LastEditTime: 2020-10-04 15:21:50
 */
export default class VoteOption {
  type: number;

  voteName: string;

  votes = 0;

  constructor(type: number, voteName: string) {
    this.type = type;
    this.voteName = voteName;
  }
}
