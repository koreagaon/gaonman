"""Run with Python 3: python server.py. SMTP variables enable the contact form."""
from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
from email.message import EmailMessage
import json,os,smtplib,ssl,pathlib,time,threading
ROOT=pathlib.Path(__file__).resolve().parent
CONTACT_TO=os.getenv('CONTACT_TO') or 'asianwave@naver.com'
recent={};lock=threading.Lock()
class Handler(SimpleHTTPRequestHandler):
 def __init__(self,*a,**kw):super().__init__(*a,directory=str(ROOT),**kw)
 def log_message(self,*a):pass
 def do_POST(self):
  if self.path!='/api/contact':return self.send_error(404)
  def reply(code):
   self.send_response(code);self.send_header('Content-Type','application/json');self.end_headers();self.wfile.write(json.dumps({'success':code==200}).encode())
  if not all(os.getenv(k) for k in ('SMTP_HOST','SMTP_FROM')):return reply(503)
  try:
   length=int(self.headers.get('Content-Length',0))
   if not 0<length<=16000:return reply(400)
   data=json.loads(self.rfile.read(length));name=str(data.get('name','')).strip();contact=str(data.get('email','')).strip();message=str(data.get('message','')).strip()
   if not name or not contact or not message or len(name)>200 or len(contact)>300 or len(message)>10000:return reply(400)
   with lock:
    now=time.time();ip=self.client_address[0]
    if now-recent.get(ip,0)<30:return reply(429)
    recent[ip]=now
   mail=EmailMessage();mail['Subject']='GAON website consultation';mail['From']=os.environ['SMTP_FROM'];mail['To']=CONTACT_TO;mail.set_content('Name: '+name+'\nContact: '+contact+'\n\n'+message)
   with smtplib.SMTP(os.environ['SMTP_HOST'],int(os.getenv('SMTP_PORT','587')),timeout=20) as smtp:
    smtp.starttls(context=ssl.create_default_context())
    if os.getenv('SMTP_USER'):smtp.login(os.environ['SMTP_USER'],os.environ['SMTP_PASSWORD'])
    smtp.send_message(mail)
   reply(200)
  except Exception:reply(502)
 def do_GET(self):
  if self.path.split('?')[0] in ('/server.py','/README.md'):return self.send_error(404)
  return super().do_GET()
if __name__=='__main__':
 port=int(os.getenv('PORT','8765'));print('Website: http://localhost:'+str(port),flush=True);ThreadingHTTPServer(('127.0.0.1' if not os.getenv('HOST') else os.environ['HOST'],port),Handler).serve_forever()
