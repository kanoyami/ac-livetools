/*
 * @Date: 2020-10-04 15:10:37
 * @LastEditors: kanoyami
 * @LastEditTime: 2020-10-04 15:13:16
 */
export default class Voteman {
  id: string;

  nickName: string;

  type: number;

  voteName: string;

  constructor(id: string, nickName: string, type: number, voteName: string) {
    this.id = id;
    this.type = type;
    this.nickName = nickName;
    this.voteName = voteName;
  }
}
