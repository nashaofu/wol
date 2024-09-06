import { useCallback, useEffect } from "react";
import { Form, Input, Modal, InputNumber } from "antd";
import { get } from "lodash-es";
import { Device } from "@/types/device";
import useMessage from "@/hooks/useMessage";
import { useAddDevice, useUpdateDevice } from "@/hooks/useDevices";

export type DeviceEditModel = Omit<Device, "uid">;

export interface DeviceEditProps {
  device?: Device | null;
  open: boolean;
  onOk: () => unknown;
  onCancel: () => unknown;
}

export default function DeviceEdit({
  device,
  open,
  onOk,
  onCancel,
}: DeviceEditProps) {
  const [form] = Form.useForm<DeviceEditModel>();
  const message = useMessage();
  const { isMutating: addDeviceLoading, trigger: addDevice } = useAddDevice({
    onSuccess: () => {
      onOk();
      message.success("添加成功");
    },
    onError: (err) => {
      message.error(get(err, "response.data.message", "添加失败"));
    },
  });
  const { isMutating: updateDeviceLoading, trigger: updateDevice } =
    useUpdateDevice({
      onSuccess: () => {
        onOk();
        message.success("保存成功");
      },
      onError: (err) => {
        message.error(get(err, "response.data.message", "保存失败"));
      },
    });

  const loading = addDeviceLoading || updateDeviceLoading;

  const onFinish = useCallback(() => {
    const deviceModel = form.getFieldsValue();
    if (device) {
      updateDevice({
        ...deviceModel,
        uid: device.uid,
      });
    } else {
      addDevice(deviceModel);
    }
  }, [form, device, updateDevice, addDevice]);

  useEffect(() => {
    if (!open) {
      return;
    }

    if (device) {
      form.setFieldsValue({
        name: device.name,
        mac: device.mac,
        ip: device.ip,
        netmask: device.netmask,
        port: device.port,
      });
    } else {
      form.resetFields();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <Modal
      title={device ? "编辑设备" : "添加设备"}
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
        name={device?.mac}
        layout="vertical"
        autoComplete="off"
        onFinish={onFinish}
        scrollToFirstError
      >
        <Form.Item
          label="设备名"
          name="name"
          required
          validateFirst
          rules={[
            {
              type: "string",
              required: true,
              message: "请填写设备名",
            },
            {
              type: "string",
              max: 30,
              message: "设备名长度不得超过 30 个字符",
            },
          ]}
        >
          <Input showCount maxLength={30} placeholder="设备名" />
        </Form.Item>
        <Form.Item
          label="MAC 地址"
          name="mac"
          required
          validateFirst
          rules={[
            {
              type: "string",
              required: true,
              message: "请输入 MAC 地址",
            },
            {
              type: "string",
              pattern: /^([A-F0-9]{2}:){5}[A-F0-9]{2}$/,
              message: "请输入正确的 MAC 地址",
            },
          ]}
        >
          <Input showCount placeholder="AA:BB:CC:DD:EE:FF" />
        </Form.Item>
        <Form.Item
          label="IP 地址"
          name="ip"
          required
          validateFirst
          rules={[
            {
              type: "string",
              required: true,
              message: "请输入 IP 地址",
            },
            {
              type: "string",
              pattern: /^(\d{1,3}\.){3}\d{1,3}$/,
              message: "请输入正确的 IP 地址",
            },
          ]}
        >
          <Input showCount placeholder="192.168.1.1" />
        </Form.Item>
        <Form.Item
          label="子网掩码"
          name="netmask"
          required
          validateFirst
          rules={[
            {
              type: "string",
              pattern: /^(\d{1,3}\.){3}\d{1,3}$/,
              message: "请输入正确的子网掩码",
            },
          ]}
          initialValue="255.255.255.0"
        >
          <Input showCount placeholder="255.255.255.0" />
        </Form.Item>
        <Form.Item
          label="端口号"
          name="port"
          required
          validateFirst
          rules={[
            {
              type: "number",
              required: true,
              message: "请输入端口号",
            },
            {
              type: "number",
              min: 0,
              max: 65535,
              message: "请输入正确端口号",
            },
          ]}
          initialValue={9}
        >
          <InputNumber min={0} max={65535} />
        </Form.Item>
      </Form>
    </Modal>
  );
}
