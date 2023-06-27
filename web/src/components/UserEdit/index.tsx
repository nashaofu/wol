import { useCallback, useEffect } from 'react';
import { Form, Input, Modal } from 'antd';
import { get } from 'lodash-es';
import { Device } from '@/types/device';
import useMessage from '@/hooks/useMessage';
import { useSaveUser, useUser } from '@/hooks/useUser';

export type DeviceEditModel = Omit<Device, 'uid'>;

export interface UserEditProps {
  open: boolean;
  onOk: () => unknown;
  onCancel: () => unknown;
}

export default function UserEdit({ open, onOk, onCancel }: UserEditProps) {
  const [form] = Form.useForm<DeviceEditModel>();
  const message = useMessage();

  const { data: user } = useUser();
  const { isMutating: saveUserLoading, trigger: saveUser } = useSaveUser({
    onSuccess: () => {
      onOk();
      message.success('保存成功');
    },
    onError: (err) => {
      message.error(get(err, 'response.data.message', '保存失败'));
    },
  });

  const loading = saveUserLoading;

  const onFinish = useCallback(() => {
    const userModel = form.getFieldsValue();
    saveUser(userModel);
  }, [form, saveUser]);

  useEffect(() => {
    if (!open) {
      return;
    }

    form.setFieldsValue({
      username: user?.username,
      password: user?.password,
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <Modal
      title="编辑用户"
      open={open}
      onOk={form.submit}
      onCancel={onCancel}
      closable={!loading}
      maskClosable={false}
      keyboard={false}
      okButtonProps={{
        loading,
      }}
      cancelButtonProps={{
        loading,
      }}
    >
      <Form
        form={form}
        layout="vertical"
        autoComplete="off"
        onFinish={onFinish}
        scrollToFirstError
      >
        <Form.Item
          label="用户名"
          name="username"
          required
          validateFirst
          rules={[
            {
              type: 'string',
              required: true,
              message: '请填写用户名',
            },
            {
              type: 'string',
              max: 30,
              message: '用户名长度不得超过 30 个字符',
            },
          ]}
        >
          <Input showCount maxLength={30} placeholder="用户名" />
        </Form.Item>
        <Form.Item
          label="密码"
          name="mac"
          required
          validateFirst
          rules={[
            {
              type: 'string',
              required: true,
              message: '请输入密码',
            },
            {
              type: 'string',
              max: 30,
              message: '密码长度不得超过 30 个字符',
            },
          ]}
        >
          <Input showCount type="password" placeholder="密码" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
