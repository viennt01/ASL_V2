import { ROUTERS } from '@/constant/router';
import useI18n from '@/i18n/useI18N';
import { useQuery } from '@tanstack/react-query';
import {
  Button,
  Form,
  Input,
  Typography,
  Card,
  Row,
  Col,
  Select,
  Descriptions,
} from 'antd';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { getListCountry, getListTypePort, getPortDetail } from '../fetcher';
import { FormValues, STATUS_LABELS } from '../interface';
import { API_MASTER_DATA } from '@/fetcherAxios/endpoint';

const initialValue = {
  portCode: '',
  portName: '',
  countryID: '',
  address: '',
  company: '',
};

interface Option {
  value: string;
  label: string;
}

interface PortFormProps {
  create?: boolean;
  handleSubmit: (formValues: FormValues) => void;
}

const { Title } = Typography;

const PortForm = ({ create, handleSubmit }: PortFormProps) => {
  const { translate: translatePort } = useI18n('port');
  const router = useRouter();
  const [form] = Form.useForm<FormValues>();
  const { id } = router.query;
  const [options, setOptions] = useState<Option[]>([]);
  useEffect(() => {
    if (!id) return;
  }, [router, form]);

  const onFinish = (formValues: FormValues) => {
    handleSubmit(formValues);
  };

  useQuery({
    queryKey: ['countries'],
    queryFn: () =>
      getListCountry({
        currentPage: 1,
        pageSize: 500,
      }),
    onSuccess(data) {
      if (data.status) {
        setOptions(
          data.data.data.map((item) => ({
            value: item.countryID,
            label: item.countryName,
          }))
        );
      }
    },
  });

  const portDetailQuery = useQuery({
    queryKey: ['portDetail', id],
    queryFn: () => getPortDetail(id as string),
    enabled: id !== undefined,
  });

  const typePortQuery = useQuery({
    queryKey: [API_MASTER_DATA.GET_TYPE_PORT],
    queryFn: () => getListTypePort(),
  });

  useEffect(() => {
    if (portDetailQuery.data) {
      form.setFieldsValue({
        portName: portDetailQuery.data.data.portName,
        portCode: portDetailQuery.data.data.portCode,
        countryID: portDetailQuery.data.data.countryID,
        // address: portDetailQuery.data.data.address,
      });
    }
  }, [portDetailQuery.data, form]);

  return (
    <div style={{ padding: '24px 0' }}>
      <Form
        form={form}
        initialValues={initialValue}
        onFinish={onFinish}
        autoComplete="off"
        layout="vertical"
      >
        <Card style={{ marginBottom: 24 }}>
          <Row justify={'center'}>
            <Col>
              <Title level={3}>
                {create
                  ? 'Thêm cảng mới'
                  : translatePort('information_edit_port')}
              </Title>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col lg={12} span={24}>
              <Form.Item
                label={translatePort('code')}
                tooltip={translatePort('code')}
                name="portCode"
                rules={[
                  {
                    required: true,
                    message: 'Please input Port Code',
                  },
                ]}
              >
                <Input
                  placeholder={translatePort('new_port_placeholder')}
                  size="large"
                />
              </Form.Item>
            </Col>
            <Col lg={12} span={24}>
              <Form.Item
                label={translatePort('name')}
                name="portName"
                rules={[
                  {
                    required: true,
                    message: 'Please input Port Name',
                  },
                ]}
              >
                <Input
                  placeholder={translatePort('new_port_title')}
                  size="large"
                />
              </Form.Item>
            </Col>

            <Col lg={12} span={24}>
              <Form.Item
                label={translatePort('type_of_port')}
                name="typePorts"
                rules={[
                  { required: true, message: 'Please input type of port' },
                ]}
              >
                <Select
                  placeholder="Please input type of port"
                  mode="multiple"
                  size="large"
                  options={typePortQuery.data?.data.map((type) => ({
                    label: type.typePortName,
                    value: type.typePortID,
                  }))}
                />
              </Form.Item>
            </Col>
            <Col lg={!create ? 6 : 12} span={24}>
              <Form.Item
                label={translatePort('country_name')}
                name="countryID"
                rules={[
                  {
                    required: true,
                    message: 'Please select Country!',
                  },
                ]}
              >
                <Select
                  options={options}
                  showSearch
                  placeholder="Please select city"
                  size="large"
                  filterOption={(input, option) =>
                    (option?.label ?? '')
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                />
              </Form.Item>
            </Col>
            {!create ? (
              <Col lg={6} span={24}>
                <Form.Item
                  label={translatePort('status')}
                  name="status"
                  rules={[
                    {
                      required: true,
                      message: 'Please input type of status',
                    },
                  ]}
                >
                  <Select
                    size="large"
                    placeholder="Please select status"
                    options={Object.values(STATUS_LABELS).map(
                      (type, index) => ({
                        label: type,
                        value: index + 1,
                      })
                    )}
                  />
                </Form.Item>
              </Col>
            ) : (
              <></>
            )}

            <Col lg={12} span={24}>
              <Form.Item
                label={translatePort('address')}
                name="address"
                rules={[{ required: true, message: 'Please input Address' }]}
              >
                <Input placeholder="Please input Address" size="large" />
              </Form.Item>
            </Col>
            <Col lg={12} span={24}>
              <Form.Item
                label={translatePort('company')}
                name="company"
                rules={[{ required: true, message: 'Please input company' }]}
              >
                <Input size="large" placeholder="Please input name company" />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        <Card>
          <Row gutter={12}>
            <Col span={12}>
              <Button onClick={() => router.push(ROUTERS.PORT)}>Cancel</Button>

              <Button
                type="primary"
                htmlType="submit"
                style={{ marginLeft: '12px' }}
              >
                Save
              </Button>
            </Col>
            {!create ? (
              <Col span={12}>
                <Descriptions>
                  <Descriptions.Item label="Creator">
                    {portDetailQuery.data?.data.insertedBy}
                  </Descriptions.Item>
                  <Descriptions.Item label="Date create">
                    {portDetailQuery.data?.data.insertedDate}
                  </Descriptions.Item>
                </Descriptions>
              </Col>
            ) : (
              <></>
            )}
          </Row>
        </Card>
      </Form>
    </div>
  );
};

export default PortForm;
