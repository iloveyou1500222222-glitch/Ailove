import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'AI Short Video & Chat App',
      theme: ThemeData(
        brightness: Brightness.dark,
        primarySwatch: Colors.pink,
        scaffoldBackgroundColor: Colors.black,
      ),
      home: const MainScreen(),
    );
  }
}

class MainScreen extends StatefulWidget {
  const MainScreen({super.key});

  @override
  State<MainScreen> createState() => _MainScreenState();
}

class _MainScreenState extends State<MainScreen> {
  int _currentIndex = 0;

  final List<Widget> _screens = [
    const HomeScreen(),
    const NotificationScreen(),
    const AIFatherScreen(),
    const ProfileScreen(),
    const SettingsScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: _screens[_currentIndex],
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentIndex,
        type: BottomNavigationBarType.fixed,
        backgroundColor: Colors.black,
        selectedItemColor: Colors.pinkAccent,
        unselectedItemColor: Colors.grey,
        onTap: (index) {
          setState(() {
            _currentIndex = index;
          });
        },
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.home), label: 'Home'),
          BottomNavigationBarItem(icon: Icon(Icons.notifications), label: 'Friends'),
          BottomNavigationBarItem(icon: Icon(Icons.smart_toy), label: 'AI Father'),
          BottomNavigationBarItem(icon: Icon(Icons.person), label: 'Profile'),
          BottomNavigationBarItem(icon: Icon(Icons.settings), label: 'Admin'),
        ],
      ),
    );
  }
}

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return PageView.builder(
      scrollDirection: Axis.vertical,
      itemCount: 5,
      itemBuilder: (context, index) {
        return Stack(
          children: [
            Container(
              color: index % 2 == 0 ? Colors.blueGrey[900] : Colors.deepPurple[900],
              child: Center(
                child: Text('Short Video Feed #${index + 1}', 
                  style: const TextStyle(fontSize: 20, color: Colors.white),
                ),
              ),
            ),
            Positioned(
              right: 15,
              bottom: 100,
              child: Column(
                children: [
                  const CircleAvatar(radius: 25, backgroundColor: Colors.grey),
                  const SizedBox(height: 20),
                  const Icon(Icons.star, color: Colors.amber, size: 35),
                  const Text('1.2K', style: TextStyle(color: Colors.white)),
                  const SizedBox(height: 20),
                  IconButton(
                    icon: const Icon(Icons.comment, color: Colors.white, size: 30),
                    onPressed: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (context) => const AIChatScreen(botName: "AI ဇာတ်ကောင်")),
                      );
                    },
                  ),
                  const Text('340', style: TextStyle(color: Colors.white)),
                ],
              ),
            ),
          ],
        );
      },
    );
  }
}

class NotificationScreen extends StatelessWidget {
  const NotificationScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('အသိပေးချက်များနှင့် ချတ်များ')),
      body: ListView(
        children: [
          const ListTile(
            leading: Icon(Icons.notifications_active, color: Colors.pinkAccent),
            title: Text('@mgmg က သင့်ဗီဒီယိုတွင် @ခေါ်ဆိုခဲ့သည်'),
          ),
          ListTile(
            leading: const CircleAvatar(backgroundColor: Colors.pink, child: Text('AI')),
            title: const Text('AI ဇာတ်ကောင် (Bot)'),
            subtitle: const Text('မင်္ဂလာပါ...'),
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (context) => const AIChatScreen(botName: "AI ဇာတ်ကောင်")),
              );
            },
          ),
        ],
      ),
    );
  }
}

class AIFatherScreen extends StatefulWidget {
  const AIFatherScreen({super.key});

  @override
  State<AIFatherScreen> createState() => _AIFatherScreenState();
}

class _AIFatherScreenState extends State<AIFatherScreen> {
  final TextEditingController _commandController = TextEditingController();
  final List<String> _chatLogs = [
    "🤖 AI Father သို့ ကြိုဆိုပါသည်။ /newbotai ဟု ရိုက်၍ ဇာတ်ကောင်ဖန်တီးနိုင်ပါသည်။"
  ];

  void _handleCommand(String cmd) {
    setState(() {
      _chatLogs.add("User: $cmd");
      if (cmd == "/newbotai") {
        _chatLogs.add("AI Father: ကျေးဇူးပြု၍ ဇာတ်ကောင်အမည် ပေးပါ (ဥပမာ - @love_ai)");
      } else {
        _chatLogs.add("AI Father: အမိန့် ပုံစံ မမှန်ပါ။");
      }
    });
    _commandController.clear();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('AI Father (Bot Manager)')),
      body: Column(
        children: [
          Expanded(
            child: ListView.builder(
              itemCount: _chatLogs.length,
              itemBuilder: (context, index) {
                return Padding(
                  padding: const EdgeInsets.all(8.0),
                  child: Text(_chatLogs[index], style: const TextStyle(fontSize: 16)),
                );
              },
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(8.0),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _commandController,
                    decoration: const InputDecoration(
                      hintText: 'Command ရိုက်ရန် (/newbotai)',
                      border: OutlineInputBorder(),
                    ),
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.send, color: Colors.pinkAccent),
                  onPressed: () {
                    if (_commandController.text.isNotEmpty) {
                      _handleCommand(_commandController.text);
                    }
                  },
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class AIChatScreen extends StatefulWidget {
  final String botName;
  const AIChatScreen({super.key, required this.botName});

  @override
  State<AIChatScreen> createState() => _AIChatScreenState();
}

class _AIChatScreenState extends State<AIChatScreen> {
  final TextEditingController _msgController = TextEditingController();
  final List<Map<String, String>> _messages = [];

  Future<void> _sendMessage(String message) async {
    setState(() {
      _messages.add({"sender": "user", "text": message});
    });
    _msgController.clear();

    try {
      final response = await http.post(
        Uri.parse('https://ailove.onrender.com/api/chat'),
        headers: {"Content-Type": "application/json"},
        body: jsonEncode({
          "botUsername": "@love45_ai",
          "userMessage": message,
        }),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        setState(() {
          _messages.add({"sender": "bot", "text": data['reply']});
        });
      } else {
        setState(() {
          _messages.add({"sender": "bot", "text": "အမှားအယွင်း ရှိနေပါသည်။"});
        });
      }
    } catch (e) {
      setState(() {
        _messages.add({"sender": "bot", "text": "ဆာဗာသို့ ချိတ်ဆက်၍ မရပါ။"});
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(widget.botName)),
      body: Column(
        children: [
          Expanded(
            child: ListView.builder(
              itemCount: _messages.length,
              itemBuilder: (context, index) {
                final msg = _messages[index];
                bool isUser = msg["sender"] == "user";
                return Align(
                  alignment: isUser ? Alignment.centerRight : Alignment.centerLeft,
                  child: Container(
                    margin: const EdgeInsets.all(8),
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: isUser ? Colors.pinkAccent : Colors.grey[800],
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Text(msg["text"]!, style: const TextStyle(color: Colors.white)),
                  ),
                );
              },
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(8.0),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _msgController,
                    decoration: const InputDecoration(
                      hintText: 'စာရေးရန်...',
                      border: OutlineInputBorder(),
                    ),
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.send, color: Colors.pinkAccent),
                  onPressed: () {
                    if (_msgController.text.isNotEmpty) {
                      _sendMessage(_msgController.text);
                    }
                  },
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});
  @override
  Widget build(BuildContext context) => const Scaffold(body: Center(child: Text('Profile Page')));
}

class SettingsScreen extends StatelessWidget {
  const SettingsScreen({super.key});
  @override
  Widget build(BuildContext context) => const Scaffold(body: Center(child: Text('Admin & Settings Page')));
}
