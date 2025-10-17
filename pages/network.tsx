// pages/iot-interview.tsx
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';

const IoTInterview = () => {
  const router = useRouter();
  const [currentStage, setCurrentStage] = useState(0);
  const [timeLeft, setTimeLeft] = useState(1800);
  const [code, setCode] = useState<string>('');
  const [deviceStatus, setDeviceStatus] = useState<'online' | 'offline' | 'error'>('online');
  const [sensorData, setSensorData] = useState<any[]>([]);
  const [networkTopology, setNetworkTopology] = useState<any[]>([]);
  const [mqttMessages, setMqttMessages] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeView, setActiveView] = useState('devices');

  // 物联网特有的面试阶段
  const interviewStages = [
    {
      title: "智能农业监控系统",
      type: "embedded_system",
      description: "设计大棚环境监控的嵌入式系统",
      content: `硬件配置：
• ESP32主控制器
• DHT22温湿度传感器  
• 土壤湿度传感器
• 光照强度传感器
• 继电器控制模块

功能要求：
1. 每5秒采集环境数据
2. 自动控制通风和灌溉
3. 数据异常时报警
4. 支持OTA远程升级`,
      timeLimit: 600,
      language: "c_cpp",
      initialCode: `#include <WiFi.h>
#include <DHT.h>
#include <PubSubClient.h>

#define DHT_PIN 4
#define SOIL_PIN A0
#define RELAY_PIN 5

DHT dht(DHT_PIN, DHT22);
WiFiClient espClient;
PubSubClient client(espClient);

void setup() {
  Serial.begin(115200);
  pinMode(RELAY_PIN, OUTPUT);
  dht.begin();
  setupWiFi();
  setupMQTT();
}

void loop() {
  // TODO: 读取传感器数据
  float temperature = dht.readTemperature();
  float humidity = dht.readHumidity();
  int soilMoisture = analogRead(SOIL_PIN);
  
  // TODO: 实现自动控制逻辑
  if (temperature > 30.0) {
    digitalWrite(RELAY_PIN, HIGH); // 开启通风
  }
  
  // TODO: 发布MQTT消息
  publishSensorData(temperature, humidity, soilMoisture);
  delay(5000);
}`,
      devices: [
        { id: 'esp32', name: 'ESP32主控', type: 'microcontroller', status: 'online', ip: '192.168.1.100' },
        { id: 'dht22', name: '温湿度传感器', type: 'sensor', status: 'online', lastRead: '23.5°C, 45%' },
        { id: 'soil', name: '土壤传感器', type: 'sensor', status: 'online', lastRead: '65%' },
        { id: 'relay', name: '继电器模块', type: 'actuator', status: 'online', state: 'off' }
      ]
    },
    {
      title: "智能家居通信协议",
      type: "iot_protocol",
      description: "设计基于MQTT的智能家居通信系统",
      content: `设备清单：
• 3个温度传感器
• 2个智能开关
• 1个智能门锁
• 1个中央网关

通信要求：
1. 设备自动发现和注册
2. 状态实时同步
3. 远程控制命令
4. 安全认证机制`,
      timeLimit: 480,
      language: "python",
      initialCode: `import paho.mqtt.client as mqtt
import json
import time

class SmartHomeHub:
    def __init__(self):
        self.devices = {}
        self.client = mqtt.Client()
        
    def on_connect(self, client, userdata, flags, rc):
        print("Connected to MQTT broker")
        # TODO: 订阅设备主题
        client.subscribe("home/+/discovery")
        client.subscribe("home/+/status")
        
    def on_message(self, client, userdata, msg):
        topic = msg.topic
        payload = json.loads(msg.payload)
        
        # TODO: 处理设备发现
        if "discovery" in topic:
            self.handle_device_discovery(payload)
        # TODO: 处理状态更新
        elif "status" in topic:
            self.handle_status_update(payload)
            
    def send_command(self, device_id, command):
        # TODO: 发送控制命令
        topic = f"home/{device_id}/command"
        self.client.publish(topic, json.dumps(command))
        
    def handle_device_discovery(self, device_info):
        # TODO: 注册新设备
        pass`,
      devices: [
        { id: 'gateway', name: '中央网关', type: 'gateway', status: 'online', connections: 6 },
        { id: 'sensor1', name: '客厅传感器', type: 'sensor', status: 'online', temp: '23.1°C' },
        { id: 'sensor2', name: '卧室传感器', type: 'sensor', status: 'online', temp: '22.8°C' },
        { id: 'switch1', name: '主灯开关', type: 'switch', status: 'online', state: 'on' },
        { id: 'lock1', name: '智能门锁', type: 'lock', status: 'online', state: 'locked' }
      ]
    }
  ];

  // 模拟传感器数据流
  useEffect(() => {
    const generateSensorData = () => {
      const baseTemp = 22 + Math.random() * 3;
      const baseHumidity = 40 + Math.random() * 20;
      const baseSoil = 30 + Math.random() * 40;
      
      return {
        timestamp: new Date().toISOString(),
        temperature: parseFloat(baseTemp.toFixed(1)),
        humidity: parseFloat(baseHumidity.toFixed(1)),
        soilMoisture: parseInt(baseSoil.toFixed(0)),
        light: 500 + Math.random() * 1000
      };
    };

    const interval = setInterval(() => {
      setSensorData(prev => {
        const newData = [...prev, generateSensorData()];
        return newData.slice(-8); // 保留最近8条数据
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // 模拟网络拓扑
  useEffect(() => {
    const topology = [
      { id: 'gateway', type: 'gateway', x: 50, y: 50, connections: ['node1', 'node2', 'node3'] },
      { id: 'node1', type: 'sensor', x: 20, y: 30, connections: ['gateway'] },
      { id: 'node2', type: 'sensor', x: 50, y: 20, connections: ['gateway'] },
      { id: 'node3', type: 'actuator', x: 80, y: 30, connections: ['gateway'] }
    ];
    setNetworkTopology(topology);
  }, []);

  // 模拟MQTT消息
  useEffect(() => {
    const messages = [
      { topic: 'home/livingroom/temperature', payload: '23.5', qos: 0, timestamp: new Date().toISOString() },
      { topic: 'home/bedroom/humidity', payload: '45%', qos: 0, timestamp: new Date().toISOString() },
      { topic: 'home/kitchen/light', payload: 'ON', qos: 1, timestamp: new Date().toISOString() }
    ];
    setMqttMessages(messages);

    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        const newMsg = {
          topic: `home/sensor${Math.floor(Math.random() * 3) + 1}/data`,
          payload: (20 + Math.random() * 5).toFixed(1),
          qos: 0,
          timestamp: new Date().toISOString()
        };
        setMqttMessages(prev => [newMsg, ...prev.slice(0, 4)]);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // 设备状态模拟
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.9) {
        setDeviceStatus('error');
        setTimeout(() => setDeviceStatus('online'), 3000);
      }
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  // 倒计时效果
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0) {
          clearInterval(timer);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (interviewStages[currentStage]?.initialCode) {
      setCode(interviewStages[currentStage].initialCode);
    }
  }, [currentStage]);

  const handleNextStage = () => {
    if (currentStage < interviewStages.length - 1) {
      setCurrentStage(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePreviousStage = () => {
    if (currentStage > 0) {
      setCurrentStage(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      router.push('/interview-complete');
    }, 2000);
  };

  const handleAutoSubmit = () => {
    if (!isSubmitting) {
      handleSubmit();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const currentStageData = interviewStages[currentStage];

  // 设备状态组件
  const DeviceStatus = ({ devices }: { devices: any[] }) => (
    <div className="grid grid-cols-2 gap-3">
      {devices.map(device => (
        <div key={device.id} className="bg-white/5 rounded-lg p-3 border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-white">{device.name}</span>
            <div className={`w-2 h-2 rounded-full ${
              device.status === 'online' ? 'bg-green-400 animate-pulse' : 
              device.status === 'error' ? 'bg-red-400' : 'bg-gray-400'
            }`}></div>
          </div>
          <div className="text-xs text-gray-400 space-y-1">
            <div>类型: {device.type}</div>
            {device.ip && <div>IP: {device.ip}</div>}
            {device.lastRead && <div>读数: {device.lastRead}</div>}
            {device.temp && <div>温度: {device.temp}</div>}
            {device.state && <div>状态: {device.state}</div>}
            {device.connections && <div>连接: {device.connections}个设备</div>}
          </div>
        </div>
      ))}
    </div>
  );

  // 传感器数据仪表盘
  const SensorDashboard = ({ data }: { data: any[] }) => {
    const current = data[data.length - 1] || {};
    
    return (
      <div className="bg-white/5 rounded-lg border border-white/10 p-4">
        <h4 className="font-semibold text-green-300 mb-3">实时传感器数据</h4>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">{current.temperature || '--'}°C</div>
            <div className="text-xs text-gray-400">温度</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">{current.humidity || '--'}%</div>
            <div className="text-xs text-gray-400">湿度</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400">{current.soilMoisture || '--'}%</div>
            <div className="text-xs text-gray-400">土壤湿度</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">{current.light || '--'}</div>
            <div className="text-xs text-gray-400">光照</div>
          </div>
        </div>

        {/* 数据趋势图 */}
        <div className="flex items-end justify-between h-16 bg-white/5 rounded p-2">
          {data.slice(-6).map((point, index) => (
            <div key={index} className="flex flex-col items-center flex-1">
              <div 
                className="w-3 bg-gradient-to-t from-cyan-500 to-blue-500 rounded-t"
                style={{ height: `${(point.temperature - 20) * 4}px` }}
              ></div>
              <div className="text-xs text-gray-400 mt-1">{point.temperature}°</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // 网络拓扑可视化
  const NetworkTopology = ({ topology }: { topology: any[] }) => (
    <div className="bg-white/5 rounded-lg border border-white/10 p-4">
      <h4 className="font-semibold text-blue-300 mb-3">网络拓扑</h4>
      <div className="relative h-48 bg-gradient-to-br from-gray-800 to-gray-900 rounded">
        {topology.map(node => (
          <div key={node.id}>
            {/* 节点 */}
            <div 
              className={`absolute w-8 h-8 rounded-full flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 ${
                node.type === 'gateway' ? 'bg-purple-500 border-2 border-purple-300' :
                node.type === 'sensor' ? 'bg-green-500 border-2 border-green-300' :
                'bg-blue-500 border-2 border-blue-300'
              }`}
              style={{ left: `${node.x}%`, top: `${node.y}%` }}
            >
              <span className="text-xs font-bold text-white">
                {node.type === 'gateway' ? 'G' : node.type === 'sensor' ? 'S' : 'A'}
              </span>
            </div>
            
            {/* 连接线 */}
            {node.connections?.map((connId: string) => {
              const connNode = topology.find(n => n.id === connId);
              if (!connNode) return null;
              
              return (
                <svg key={connId} className="absolute inset-0 w-full h-full pointer-events-none">
                  <line 
                    x1={`${node.x}%`} 
                    y1={`${node.y}%`}
                    x2={`${connNode.x}%`}
                    y2={`${connNode.y}%`}
                    stroke="rgba(96, 165, 250, 0.5)"
                    strokeWidth="2"
                    strokeDasharray="4 2"
                  />
                </svg>
              );
            })}
          </div>
        ))}
        
        {/* 网络信号动画 */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="w-4 h-4 bg-blue-400 rounded-full animate-ping"></div>
        </div>
      </div>
    </div>
  );

  // MQTT消息监控
  const MQTTMonitor = ({ messages }: { messages: any[] }) => (
    <div className="bg-white/5 rounded-lg border border-white/10 p-4">
      <h4 className="font-semibold text-yellow-300 mb-3">MQTT消息流</h4>
      <div className="space-y-2 max-h-32 overflow-y-auto">
        {messages.map((msg, index) => (
          <div key={index} className="flex justify-between items-center p-2 bg-white/5 rounded text-xs">
            <div className="flex-1">
              <div className="text-cyan-300 font-mono">{msg.topic}</div>
              <div className="text-gray-400">{msg.payload}</div>
            </div>
            <div className="text-right">
              <div className="text-gray-400">QoS {msg.qos}</div>
              <div className="text-gray-500 text-xs">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-cyan-900 to-blue-900 text-white p-6">
      {/* 头部信息栏 - 物联网风格 */}
      <header className="mb-6">
        <div className="bg-white/5 rounded-2xl border border-white/10 p-6 backdrop-blur-sm">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-6">
              {/* 时间显示 */}
              <div className="text-center">
                <div className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  {formatTime(timeLeft)}
                </div>
                <div className="text-sm text-gray-400 mt-1">剩余时间</div>
              </div>
              
              <div className="h-12 w-px bg-gradient-to-b from-transparent via-white/20 to-transparent"></div>
              
              {/* 面试信息 */}
              <div>
                <div className="text-xl font-bold text-white">物联网工程师面试</div>
                <div className="text-sm text-gray-400 flex space-x-4 mt-1">
                  <span>编号: IOT2024001</span>
                  <span>•</span>
                  <span>场景: {currentStageData.title}</span>
                </div>
              </div>
            </div>
            
            {/* 设备状态指示器 */}
            <div className="flex items-center space-x-4">
              <div className={`flex items-center space-x-2 px-4 py-2 rounded-full border ${
                deviceStatus === 'online' ? 'bg-green-500/20 border-green-400/30 text-green-400' :
                deviceStatus === 'error' ? 'bg-red-500/20 border-red-400/30 text-red-400' :
                'bg-gray-500/20 border-gray-400/30 text-gray-400'
              }`}>
                <div className={`w-2 h-2 rounded-full animate-pulse ${
                  deviceStatus === 'online' ? 'bg-green-400' :
                  deviceStatus === 'error' ? 'bg-red-400' : 'bg-gray-400'
                }`}></div>
                <span className="text-sm">
                  {deviceStatus === 'online' ? '设备在线' : 
                   deviceStatus === 'error' ? '连接异常' : '设备离线'}
                </span>
              </div>
              
              <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                <span className="font-bold text-white">李</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 主要内容区域 - 物联网特色布局 */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 h-[calc(100vh-180px)]">
        
        {/* 左侧：设备监控和网络视图 */}
        <div className="xl:col-span-1 space-y-6">
          {/* 题目卡片 */}
          <div className="bg-white/5 rounded-2xl border border-white/10 p-6 backdrop-blur-sm">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-bold text-cyan-400">{currentStageData.title}</h2>
                <p className="text-gray-300 mt-1">{currentStageData.description}</p>
              </div>
              <div className="flex space-x-2">
                <span className="px-3 py-1 bg-cyan-500/20 border border-cyan-400/30 rounded-full text-cyan-400 text-sm">
                  {formatTime(currentStageData.timeLimit)}
                </span>
              </div>
            </div>
            
            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <div className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                {currentStageData.content}
              </div>
            </div>
          </div>

          {/* 视图切换 */}
          <div className="bg-white/5 rounded-2xl border border-white/10 p-4 backdrop-blur-sm">
            <div className="flex space-x-2">
              {['devices', 'network', 'messages'].map(view => (
                <button
                  key={view}
                  onClick={() => setActiveView(view)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeView === view
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {view === 'devices' && '📱 设备管理'}
                  {view === 'network' && '🌐 网络拓扑'}
                  {view === 'messages' && '📨 消息监控'}
                </button>
              ))}
            </div>
          </div>

          {/* 动态内容区域 */}
          <div className="bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm overflow-hidden">
            {activeView === 'devices' && (
              <div className="p-4">
                <h3 className="font-semibold text-green-400 mb-3">设备状态监控</h3>
                <DeviceStatus devices={currentStageData.devices} />
              </div>
            )}
            
            {activeView === 'network' && (
              <div className="p-4">
                <NetworkTopology topology={networkTopology} />
              </div>
            )}
            
            {activeView === 'messages' && (
              <div className="p-4">
                <MQTTMonitor messages={mqttMessages} />
              </div>
            )}
          </div>
        </div>

        {/* 中央：代码编辑和传感器数据 */}
        <div className="xl:col-span-2 grid grid-rows-2 gap-6">
          {/* 代码编辑区域 */}
          <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden backdrop-blur-sm">
            <div className="flex justify-between items-center p-4 border-b border-white/10 bg-white/5">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-cyan-400 font-mono">
                  {currentStageData.type === 'embedded_system' ? 'firmware.ino' : 'hub.py'}
                </span>
              </div>
              
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-400 font-mono">
                  {currentStageData.language.toUpperCase()}
                </span>
              </div>
            </div>

            <div className="p-4 h-64">
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full h-full bg-gray-800/50 border border-gray-600 rounded-lg p-4 text-white font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-cyan-400"
                spellCheck={false}
              />
            </div>
          </div>

          {/* 传感器数据和操作面板 */}
          <div className="grid grid-cols-2 gap-6">
            {/* 传感器仪表盘 */}
            <div className="bg-white/5 rounded-2xl border border-white/10 p-6 backdrop-blur-sm">
              <SensorDashboard data={sensorData} />
            </div>

            {/* 操作控制面板 */}
            <div className="bg-white/5 rounded-2xl border border-white/10 p-6 backdrop-blur-sm">
              <h3 className="text-lg font-semibold text-yellow-400 mb-4 flex items-center">
                <span className="mr-2">🎮</span>
                设备控制
              </h3>
              
              <div className="space-y-4">
                <button className="w-full bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white py-3 rounded-lg font-semibold transition-all flex items-center justify-center space-x-2">
                  <span>🔧</span>
                  <span>编译固件</span>
                </button>
                
                <button className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white py-3 rounded-lg font-semibold transition-all flex items-center justify-center space-x-2">
                  <span>📡</span>
                  <span>OTA升级</span>
                </button>

                <div className="grid grid-cols-2 gap-3">
                  <button className="bg-white/10 border border-white/20 hover:bg-white/20 text-white py-2 rounded-lg transition-all flex items-center justify-center space-x-2">
                    <span>💡</span>
                    <span>开启设备</span>
                  </button>
                  
                  <button className="bg-white/10 border border-white/20 hover:bg-white/20 text-white py-2 rounded-lg transition-all flex items-center justify-center space-x-2">
                    <span>🔒</span>
                    <span>关闭设备</span>
                  </button>
                </div>

                <div className="flex space-x-3 pt-2">
                  <button
                    onClick={handlePreviousStage}
                    disabled={currentStage === 0}
                    className="flex-1 bg-white/10 border border-white/20 hover:bg-white/20 text-white py-2 rounded-lg transition-all disabled:opacity-50"
                  >
                    上一场景
                  </button>
                  
                  {currentStage === interviewStages.length - 1 ? (
                    <button
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white py-2 rounded-lg font-semibold transition-all disabled:opacity-50 flex items-center justify-center"
                    >
                      {isSubmitting ? '部署中...' : '完成部署'}
                    </button>
                  ) : (
                    <button
                      onClick={handleNextStage}
                      className="flex-1 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white py-2 rounded-lg font-semibold transition-all flex items-center justify-center space-x-2"
                    >
                      <span>⚡</span>
                      <span>下一场景</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 物联网特有的背景装饰 */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
        {/* 设备节点网络 */}
        <div className="absolute inset-0 opacity-20">
          {Array.from({ length: 15 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-cyan-400 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${2 + Math.random() * 3}s`
              }}
            />
          ))}
        </div>
        
        {/* 信号波动画 */}
        <div className="absolute top-1/2 left-1/4 transform -translate-x-1/2 -translate-y-1/2">
          <div className="w-8 h-8 border-2 border-cyan-400 rounded-full animate-ping"></div>
        </div>
        
        <div className="absolute bottom-1/3 right-1/4 transform translate-x-1/2 translate-y-1/2">
          <div className="w-6 h-6 border-2 border-blue-400 rounded-full animate-ping" style={{animationDelay: '1s'}}></div>
        </div>

        {/* 装饰性图标 */}
        <div className="absolute top-10 right-10 opacity-10 text-6xl">📡</div>
        <div className="absolute bottom-10 left-10 opacity-10 text-6xl">🔌</div>
        <div className="absolute top-1/3 left-1/4 opacity-10 text-4xl">🌡️</div>
        <div className="absolute bottom-1/3 right-1/4 opacity-10 text-4xl">💡</div>
      </div>
    </div>
  );
};

export default IoTInterview;