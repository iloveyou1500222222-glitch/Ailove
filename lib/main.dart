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
      title: 'AI Chat App',
      theme: ThemeData(brightness: Brightness.dark, primaryColor: Colors.pink),
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
    const Center(child: Text('TikTok Feed (Home)', style: TextStyle(fontSize: 20))),
    const Center(child: Text('Notifications & Chat', style: TextStyle(fontSize: 20))),
    const AIFatherScreen(),
    const Center(child: Text('Profile', style: TextStyle(fontSize: 20))),
    const Center(child: Text('Admin Settings', style: TextStyle(fontSize: 20))),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: _screens[_currentIndex],
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentIndex,
        type: BottomNavigationBarType.fixed,
        selectedItemColor: Colors.pinkAccent,
        onTap: (index) => setState(() => _currentIndex = index),
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

// AI Father Screen & Command System
class AIFatherScreen extends StatefulWidget {
  const AIFatherScreen({super.key});

  @override
  State<AIFatherScreen> createState() => _AIFatherScreenState();
}

class _AIFatherScreenState extends State<AIFatherScreen> {
  final TextEditingController _cmdController = TextEditingController();
  final List<String> _logs = ["🤖 AI Father သို့ ကြိုဆိုပါသည်။ /newbotai ဟု ရိုက်ပါ။"];

  void _sendCmd(String text) async {
    setState(() => _logs.add("User: $text"));
    _cmdController.clear();
    
    if (text == "/newbotai") {
      setState(() => _logs.add("AI Father: Bot အမည်နှင့် ဇာတ်ညွှန်း သတ်မှတ်ပြီးပါပြီ။"));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('AI Father (BotFather)')),
      body: Column(
        children: [
          Expanded(
            child: ListView.builder(
              itemCount: _logs.length,
              itemBuilder: (context, i) => Padding(padding: const EdgeInsets.all(8.0), child: Text(_logs[i])),
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(8.0),
            child: Row(
              children: [
                Expanded(child: TextField(controller: _cmdController, decoration: const InputDecoration(hintText: 'Command ရိုက်ရန်...'))),
                IconButton(icon: const Icon(Icons.send, color: Colors.pink), onPressed: () => _sendCmd(_cmdController.text)),
              ],
            ),
          )
        ],
      ),
    );
  }
}
