import { Injectable } from '@nestjs/common';
import Dysmsapi20170525, * as $Dysmsapi20170525 from '@alicloud/dysmsapi20170525';
import * as $OpenApi from '@alicloud/openapi-client';
import * as $Util from '@alicloud/tea-util';

@Injectable()
export class MessageService {
  client = new Dysmsapi20170525(
    new $OpenApi.Config({
      endpoint: `dysmsapi.aliyuncs.com`,
    }),
  );

  async sendMessage(phoneNumbers: string, code: string) {
    const sendSmsRequest = new $Dysmsapi20170525.SendSmsRequest({
      signName: 'editor短信服务',
      templateCode: 'SMS_473240065',
      phoneNumbers,
      templateParam: `{"code":"${code}"}`,
    });
    const runtime = new $Util.RuntimeOptions({});
    try {
      // 复制代码运行请自行打印 API 的返回值
      await this.client.sendSmsWithOptions(sendSmsRequest, runtime);
    } catch (error) {
      console.log(error.message); // 诊断地址
      // console.log(error.data['Recommend']);
    }
  }
}
