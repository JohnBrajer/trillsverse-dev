import json
import unittest
from unittest.mock import patch
from io import StringIO
from contextlib import redirect_stdout, redirect_stderr
from trilligence.cli import main


class CliBridgeTests(unittest.TestCase):
    def test_connection_is_explicit_opt_in(self):
        with redirect_stderr(StringIO()):
            with self.assertRaises(SystemExit) as exc:
                main(['openai', '--model', 'test-model', '--text', 'HELLO'])
        self.assertEqual(exc.exception.code, 2)

    def test_demo_calls_openai_planner_and_verifies_host_handler(self):
        class FakeBrain:
            def __init__(self, *, model):
                self.model = model
            def propose(self, **_):
                from trilligence import Intent
                return Intent('normalize_text', {'text':'HELLO'})
        out = StringIO()
        with patch('trilligence.openai_bridge.OpenAIResponsesBrain', FakeBrain):
            with redirect_stdout(out):
                main(['openai', '--model', 'test-model', '--text', 'HELLO', '--send'])
        result = json.loads(out.getvalue())
        self.assertEqual(result['stop_reason'], 'GOAL_REACHED')
        self.assertEqual(result['verified'], True)
        self.assertEqual(result['brain'], 'OpenAIResponsesBrain')

if __name__ == '__main__': unittest.main()
