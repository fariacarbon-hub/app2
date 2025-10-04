#!/usr/bin/env python3
"""
Comprehensive Backend API Testing for YOU - AI Personal Growth Platform
Tests all authentication, user management, chat, goals, quiz, analytics, and support endpoints
"""

import requests
import json
import time
import os
from datetime import datetime
from typing import Dict, Any, Optional

class YouAPITester:
    def __init__(self):
        # Use the production URL from frontend/.env
        self.base_url = "https://copymind-br.preview.emergentagent.com/api"
        self.session = requests.Session()
        self.auth_token = None
        self.user_id = None
        self.test_results = []
        
        # Test data
        self.test_user = {
            "name": "Maria Silva",
            "email": f"maria.silva.{int(time.time())}@teste.com",
            "password": "MinhaSenh@123",
            "age": 28,
            "gender": "female",
            "location": "São Paulo, SP"
        }
        
        print(f"🚀 Starting YOU API Tests")
        print(f"📍 Base URL: {self.base_url}")
        print(f"👤 Test User: {self.test_user['email']}")
        print("=" * 60)

    def log_test(self, test_name: str, success: bool, details: str = "", response_data: Any = None):
        """Log test results"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}")
        if details:
            print(f"   📝 {details}")
        if not success and response_data:
            print(f"   🔍 Response: {response_data}")
        
        self.test_results.append({
            "test": test_name,
            "success": success,
            "details": details,
            "timestamp": datetime.now().isoformat()
        })
        print()

    def make_request(self, method: str, endpoint: str, data: Dict = None, headers: Dict = None) -> tuple:
        """Make HTTP request and return (success, response_data, status_code)"""
        url = f"{self.base_url}{endpoint}"
        
        # Add auth header if token exists
        if self.auth_token and headers is None:
            headers = {"Authorization": f"Bearer {self.auth_token}"}
        elif self.auth_token and headers:
            headers["Authorization"] = f"Bearer {self.auth_token}"
        
        try:
            if method.upper() == "GET":
                response = self.session.get(url, headers=headers, timeout=30)
            elif method.upper() == "POST":
                response = self.session.post(url, json=data, headers=headers, timeout=30)
            elif method.upper() == "PUT":
                response = self.session.put(url, json=data, headers=headers, timeout=30)
            elif method.upper() == "DELETE":
                response = self.session.delete(url, headers=headers, timeout=30)
            else:
                return False, f"Unsupported method: {method}", 0
            
            try:
                response_data = response.json()
            except:
                response_data = response.text
            
            return response.status_code < 400, response_data, response.status_code
            
        except requests.exceptions.RequestException as e:
            return False, str(e), 0

    def test_health_check(self):
        """Test basic health endpoint"""
        # Test the correct health endpoint path
        health_url = self.base_url.replace('/api', '/health')
        try:
            response = self.session.get(health_url, timeout=30)
            if response.status_code == 200:
                try:
                    data = response.json()
                    if isinstance(data, dict) and data.get("success"):
                        self.log_test("Health Check", True, f"Status: {data.get('message', 'OK')}")
                    else:
                        self.log_test("Health Check", False, f"Invalid JSON response", data)
                except:
                    self.log_test("Health Check", False, f"Non-JSON response", response.text[:200])
            else:
                self.log_test("Health Check", False, f"Status: {response.status_code}", response.text[:200])
        except Exception as e:
            self.log_test("Health Check", False, f"Request failed: {str(e)}")

    def test_api_root(self):
        """Test API root endpoint"""
        success, data, status = self.make_request("GET", "/")
        if success and isinstance(data, dict):
            self.log_test("API Root", True, f"Version: {data.get('version', 'N/A')}")
        else:
            self.log_test("API Root", False, f"Status: {status}", data)

    # AUTHENTICATION TESTS
    def test_user_registration(self):
        """Test user registration"""
        success, data, status = self.make_request("POST", "/auth/register", self.test_user)
        
        
        if success and isinstance(data, dict) and data.get("success"):
            user_data = data.get("data", {}).get("user", {})
            self.user_id = user_data.get("id")
            self.log_test("User Registration", True, f"User ID: {self.user_id}")
            return True
        else:
            self.log_test("User Registration", False, f"Status: {status}", data)
            return False

    def test_user_login(self):
        """Test user login"""
        login_data = {
            "email": self.test_user["email"],
            "password": self.test_user["password"]
        }
        
        success, data, status = self.make_request("POST", "/auth/login", login_data)
        
        
        if success and isinstance(data, dict) and data.get("success"):
            self.auth_token = data.get("data", {}).get("token")
            self.log_test("User Login", True, f"Token received: {bool(self.auth_token)}")
            return True
        else:
            self.log_test("User Login", False, f"Status: {status}", data)
            return False

    def test_get_current_user(self):
        """Test get current user endpoint"""
        success, data, status = self.make_request("GET", "/auth/me")
        
        if success and isinstance(data, dict) and data.get("success"):
            user_data = data.get("user", {})
            self.log_test("Get Current User", True, f"User: {user_data.get('name', 'N/A')}")
            return True
        else:
            self.log_test("Get Current User", False, f"Status: {status}", data)
            return False

    def test_user_logout(self):
        """Test user logout"""
        success, data, status = self.make_request("POST", "/auth/logout")
        
        if success:
            self.log_test("User Logout", True, "Logout successful")
            return True
        else:
            self.log_test("User Logout", False, f"Status: {status}", data)
            return False

    # USER MANAGEMENT TESTS
    def test_get_user_profile(self):
        """Test get user profile"""
        success, data, status = self.make_request("GET", "/user/profile")
        
        if success and isinstance(data, dict):
            profile = data.get("profile", {}) if data.get("success") else data
            self.log_test("Get User Profile", True, f"Profile loaded: {bool(profile)}")
            return True
        else:
            self.log_test("Get User Profile", False, f"Status: {status}", data)
            return False

    def test_update_user_profile(self):
        """Test update user profile"""
        update_data = {
            "bio": "Sou uma pessoa focada em crescimento pessoal e desenvolvimento contínuo.",
            "interests": ["desenvolvimento pessoal", "meditação", "leitura"],
            "goals": ["Melhorar autoconhecimento", "Desenvolver hábitos saudáveis"]
        }
        
        success, data, status = self.make_request("PUT", "/user/profile", update_data)
        
        if success:
            self.log_test("Update User Profile", True, "Profile updated successfully")
            return True
        else:
            self.log_test("Update User Profile", False, f"Status: {status}", data)
            return False

    def test_get_user_settings(self):
        """Test get user settings"""
        success, data, status = self.make_request("GET", "/user/settings")
        
        if success:
            self.log_test("Get User Settings", True, "Settings retrieved")
            return True
        else:
            self.log_test("Get User Settings", False, f"Status: {status}", data)
            return False

    def test_update_user_settings(self):
        """Test update user settings"""
        settings_data = {
            "notifications": {
                "email": True,
                "push": True,
                "dailyReminders": True
            },
            "privacy": {
                "profileVisibility": "private",
                "dataSharing": False
            },
            "preferences": {
                "language": "pt-BR",
                "timezone": "America/Sao_Paulo",
                "theme": "light"
            }
        }
        
        success, data, status = self.make_request("PUT", "/user/settings", settings_data)
        
        if success:
            self.log_test("Update User Settings", True, "Settings updated")
            return True
        else:
            self.log_test("Update User Settings", False, f"Status: {status}", data)
            return False

    def test_get_user_stats(self):
        """Test get user statistics"""
        success, data, status = self.make_request("GET", "/user/stats")
        
        if success:
            self.log_test("Get User Stats", True, "Stats retrieved")
            return True
        else:
            self.log_test("Get User Stats", False, f"Status: {status}", data)
            return False

    # CHAT SYSTEM TESTS
    def test_get_conversations(self):
        """Test get conversations list"""
        success, data, status = self.make_request("GET", "/chat/conversations")
        
        if success:
            conversations = data.get("conversations", []) if isinstance(data, dict) else []
            self.log_test("Get Conversations", True, f"Found {len(conversations)} conversations")
            return True
        else:
            self.log_test("Get Conversations", False, f"Status: {status}", data)
            return False

    def test_create_conversation(self):
        """Test create new conversation"""
        conversation_data = {
            "title": "Conversa sobre Desenvolvimento Pessoal",
            "type": "personal_growth",
            "context": "Quero discutir estratégias para melhorar minha produtividade e bem-estar"
        }
        
        success, data, status = self.make_request("POST", "/chat/conversations", conversation_data)
        
        if success and isinstance(data, dict):
            conversation_data = data.get("data", {}).get("conversation", {})
            conversation_id = conversation_data.get("_id") or conversation_data.get("id")
            if conversation_id:
                self.conversation_id = conversation_id
                self.log_test("Create Conversation", True, f"Conversation ID: {conversation_id}")
                return True
        
        self.log_test("Create Conversation", False, f"Status: {status}", data)
        return False

    def test_send_message(self):
        """Test send message to conversation"""
        if not hasattr(self, 'conversation_id'):
            self.log_test("Send Message", False, "No conversation ID available")
            return False
        
        message_data = {
            "content": "Olá! Gostaria de conversar sobre como posso melhorar minha rotina matinal para ser mais produtivo. Você pode me dar algumas dicas personalizadas?",
            "type": "user"
        }
        
        success, data, status = self.make_request("POST", f"/chat/conversations/{self.conversation_id}/messages", message_data)
        
        if success:
            self.log_test("Send Message", True, "Message sent and AI response received")
            return True
        else:
            self.log_test("Send Message", False, f"Status: {status}", data)
            return False

    def test_get_messages(self):
        """Test get messages from conversation"""
        if not hasattr(self, 'conversation_id'):
            self.log_test("Get Messages", False, "No conversation ID available")
            return False
        
        success, data, status = self.make_request("GET", f"/chat/conversations/{self.conversation_id}/messages")
        
        if success:
            messages = data.get("messages", []) if isinstance(data, dict) else []
            self.log_test("Get Messages", True, f"Retrieved {len(messages)} messages")
            return True
        else:
            self.log_test("Get Messages", False, f"Status: {status}", data)
            return False

    # GOALS MANAGEMENT TESTS
    def test_get_goals(self):
        """Test get goals list"""
        success, data, status = self.make_request("GET", "/goals")
        
        if success:
            goals = data.get("goals", []) if isinstance(data, dict) else []
            self.log_test("Get Goals", True, f"Found {len(goals)} goals")
            return True
        else:
            self.log_test("Get Goals", False, f"Status: {status}", data)
            return False

    def test_create_goal(self):
        """Test create new goal"""
        goal_data = {
            "title": "Desenvolver Hábito de Meditação",
            "description": "Meditar por 10 minutos todos os dias pela manhã para melhorar foco e bem-estar",
            "category": "saude_mental",
            "targetDate": "2025-12-31",
            "priority": "alta",
            "milestones": [
                {"title": "Primeira semana completa", "targetDate": "2025-11-15"},
                {"title": "Primeiro mês completo", "targetDate": "2025-12-01"}
            ]
        }
        
        success, data, status = self.make_request("POST", "/goals", goal_data)
        
        if success and isinstance(data, dict):
            goal_data = data.get("data", {}).get("goal", {})
            goal_id = goal_data.get("_id") or goal_data.get("id")
            if goal_id:
                self.goal_id = goal_id
                self.log_test("Create Goal", True, f"Goal ID: {goal_id}")
                return True
        
        self.log_test("Create Goal", False, f"Status: {status}", data)
        return False

    def test_update_goal(self):
        """Test update goal"""
        if not hasattr(self, 'goal_id'):
            self.log_test("Update Goal", False, "No goal ID available")
            return False
        
        update_data = {
            "title": "Desenvolver Hábito de Meditação Avançada",
            "description": "Meditar por 15 minutos todos os dias pela manhã para melhorar foco, bem-estar e reduzir ansiedade",
            "category": "saude_mental",
            "targetDate": "2025-12-31",
            "priority": "alta"
        }
        
        success, data, status = self.make_request("PUT", f"/goals/{self.goal_id}", update_data)
        
        if success:
            self.log_test("Update Goal", True, "Goal updated successfully")
            return True
        else:
            self.log_test("Update Goal", False, f"Status: {status}", data)
            return False

    def test_update_goal_progress(self):
        """Test update goal progress"""
        if not hasattr(self, 'goal_id'):
            self.log_test("Update Goal Progress", False, "No goal ID available")
            return False
        
        progress_data = {
            "progress": 25,
            "note": "Consegui meditar por 3 dias consecutivos esta semana. Sentindo-me mais calmo e focado.",
            "date": datetime.now().isoformat()
        }
        
        success, data, status = self.make_request("POST", f"/goals/{self.goal_id}/progress", progress_data)
        
        if success:
            self.log_test("Update Goal Progress", True, "Progress updated successfully")
            return True
        else:
            self.log_test("Update Goal Progress", False, f"Status: {status}", data)
            return False

    # QUIZ SYSTEM TESTS
    def test_get_quiz_questions(self):
        """Test get personality quiz questions"""
        success, data, status = self.make_request("GET", "/quiz/questions")
        
        if success and isinstance(data, dict):
            questions = data.get("questions", [])
            self.quiz_questions = questions
            self.log_test("Get Quiz Questions", True, f"Retrieved {len(questions)} questions")
            return True
        else:
            self.log_test("Get Quiz Questions", False, f"Status: {status}", data)
            return False

    def test_submit_quiz(self):
        """Test submit quiz answers"""
        if not hasattr(self, 'quiz_questions') or not self.quiz_questions:
            self.log_test("Submit Quiz", False, "No quiz questions available")
            return False
        
        # Create realistic answers for personality quiz
        answers = []
        for i, question in enumerate(self.quiz_questions[:10]):  # Limit to first 10 questions
            question_id = question.get("id", f"q_{i}")
            # Simulate thoughtful answers
            if i % 4 == 0:
                answer = "concordo_totalmente"
            elif i % 4 == 1:
                answer = "concordo_parcialmente"
            elif i % 4 == 2:
                answer = "neutro"
            else:
                answer = "discordo_parcialmente"
            
            answers.append({
                "questionId": question_id,
                "answer": answer
            })
        
        quiz_data = {
            "answers": answers,
            "completedAt": datetime.now().isoformat()
        }
        
        success, data, status = self.make_request("POST", "/quiz/submit", quiz_data)
        
        if success:
            self.log_test("Submit Quiz", True, "Quiz submitted and processed by AI")
            return True
        else:
            self.log_test("Submit Quiz", False, f"Status: {status}", data)
            return False

    # ANALYTICS TESTS
    def test_get_dashboard_data(self):
        """Test get analytics dashboard data"""
        success, data, status = self.make_request("GET", "/analytics/dashboard")
        
        if success:
            self.log_test("Get Dashboard Data", True, "Dashboard data retrieved")
            return True
        else:
            self.log_test("Get Dashboard Data", False, f"Status: {status}", data)
            return False

    def test_log_mood(self):
        """Test log daily mood"""
        mood_data = {
            "mood": 8,
            "energy": 8,
            "stress": 3,
            "notes": "Dia produtivo! Consegui completar todas as tarefas planejadas e ainda tive tempo para relaxar.",
            "date": datetime.now().isoformat()
        }
        
        success, data, status = self.make_request("POST", "/analytics/mood", mood_data)
        
        if success:
            self.log_test("Log Mood", True, "Mood logged successfully")
            return True
        else:
            self.log_test("Log Mood", False, f"Status: {status}", data)
            return False

    def test_get_behavior_patterns(self):
        """Test get behavior patterns"""
        success, data, status = self.make_request("GET", "/analytics/patterns")
        
        if success:
            self.log_test("Get Behavior Patterns", True, "Patterns retrieved")
            return True
        else:
            self.log_test("Get Behavior Patterns", False, f"Status: {status}", data)
            return False

    # SUPPORT TESTS
    def test_send_contact_message(self):
        """Test send contact message"""
        contact_data = {
            "name": "Maria Silva",
            "email": "maria.silva@teste.com",
            "subject": "Sugestão de Melhoria",
            "message": "Gostaria de sugerir a adição de lembretes personalizáveis para os objetivos. Seria muito útil para manter a consistência nos hábitos.",
            "category": "feedback",
            "priority": "medium"
        }
        
        success, data, status = self.make_request("POST", "/support/contact", contact_data)
        
        if success:
            self.log_test("Send Contact Message", True, "Contact message sent")
            return True
        else:
            self.log_test("Send Contact Message", False, f"Status: {status}", data)
            return False

    def test_get_faq(self):
        """Test get FAQ items"""
        success, data, status = self.make_request("GET", "/support/faq")
        
        if success:
            faq_items = data.get("faq", []) if isinstance(data, dict) else []
            self.log_test("Get FAQ", True, f"Retrieved {len(faq_items)} FAQ items")
            return True
        else:
            self.log_test("Get FAQ", False, f"Status: {status}", data)
            return False

    def run_all_tests(self):
        """Run all API tests in sequence"""
        print("🧪 Starting Comprehensive API Testing...")
        print()
        
        # Basic connectivity tests
        self.test_health_check()
        self.test_api_root()
        
        # Authentication flow
        if self.test_user_registration():
            if self.test_user_login():
                # User management tests (require authentication)
                self.test_get_current_user()
                self.test_get_user_profile()
                self.test_update_user_profile()
                self.test_get_user_settings()
                self.test_update_user_settings()
                self.test_get_user_stats()
                
                # Chat system tests
                self.test_get_conversations()
                if self.test_create_conversation():
                    self.test_send_message()
                    self.test_get_messages()
                
                # Goals management tests
                self.test_get_goals()
                if self.test_create_goal():
                    self.test_update_goal()
                    self.test_update_goal_progress()
                
                # Quiz system tests
                if self.test_get_quiz_questions():
                    self.test_submit_quiz()
                
                # Analytics tests
                self.test_get_dashboard_data()
                self.test_log_mood()
                self.test_get_behavior_patterns()
                
                # Support tests
                self.test_send_contact_message()
                self.test_get_faq()
                
                # Logout test
                self.test_user_logout()
        
        # Print summary
        self.print_summary()

    def print_summary(self):
        """Print test results summary"""
        print("=" * 60)
        print("📊 TEST RESULTS SUMMARY")
        print("=" * 60)
        
        passed = sum(1 for result in self.test_results if result["success"])
        failed = len(self.test_results) - passed
        
        print(f"✅ Passed: {passed}")
        print(f"❌ Failed: {failed}")
        print(f"📈 Success Rate: {(passed/len(self.test_results)*100):.1f}%")
        print()
        
        if failed > 0:
            print("❌ FAILED TESTS:")
            for result in self.test_results:
                if not result["success"]:
                    print(f"   • {result['test']}: {result['details']}")
            print()
        
        print("✅ PASSED TESTS:")
        for result in self.test_results:
            if result["success"]:
                print(f"   • {result['test']}")
        
        print("\n" + "=" * 60)
        print(f"🏁 Testing completed at {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print("=" * 60)

if __name__ == "__main__":
    tester = YouAPITester()
    tester.run_all_tests()