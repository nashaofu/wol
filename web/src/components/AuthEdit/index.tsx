import { useCallback, useEffect } from 'react';
import {
  Form, Input, Modal, Switch,
} from 'antd';
import { get } from 'lodash-es';
import useMessage from '@/hooks/useMessage';
import { useAuth, useSaveAuth } from '@/hooks/useAuth';
import { Auth } from '@/types/auth';

export interface AuthEditModel extends Auth {
  enable: boolean;
}

export interface AuthEditProps {
  open: boolean;
  onOk: () => unknown;
  onCancel: () => unknown;
}

export default function AuthEdit({ open, onOk, onCancel }: AuthEditProps) {
  const [form] = Form.useForm<AuthEditModel>();
  const message = useMessage();
  const enableValue = Form.useWatch('enable', form);

  const { data: auth } = useAuth();
  const { isMutating: saveAuthLoading, trigger: saveAuth } = useSaveAuth({
    onSuccess: () => {
      onOk();
      message.success('保存成功');
    },
    onError: (err) => {
      message.error(get(err, 'response.data.message', '保存失败'));
    },
  });

  const loading = saveAuthLoading;

  const onFinish = useCallback(() => {
    const authModel = form.getFieldsValue();
    saveAuth(
      authModel.enable
        ? {
          username: authModel.username,
          password: authModel.password,
        }
        : null,
    );
  }, [form, saveAuth]);

  useEffect(() => {
    if (!open) {
      return;
    }

    form.setFieldsValue({
      enable: !!auth,
      username: auth?.username,
      password: auth?.password,
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <Modal
      title="认证设置"
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
        <Form.Item label="是否启用" name="enable" required validateFirst>
          <Switch checkedChildren="启用" unCheckedChildren="关闭" />
        </Form.Item>
        {enableValue && (
          <>
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
              rules={[
                {
                  type: 'string',
                  max: 30,
                  message: '密码长度不得超过 30 个字符',
                },
              ]}
            >
              <Input.Password showCount maxLength={30} placeholder="密码" />
            </Form.Item>
          </>
        )}
      </Form>
    </Modal>
  );
}
