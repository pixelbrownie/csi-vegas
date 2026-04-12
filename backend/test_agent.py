import traceback
from agents import analyst_agent
try:
    res = analyst_agent('Analyze the fabric', 'History...')
    print(res)
except Exception as e:
    print('ERROR:', traceback.format_exc())
