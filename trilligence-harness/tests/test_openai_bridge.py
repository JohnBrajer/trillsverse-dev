"""Network-free red/green contract tests for the optional OpenAI brain."""
import json
import os
import unittest
from unittest.mock import patch

from trilligence import Agent, Capability, Harness
from trilligence.openai_bridge import OpenAIResponsesBrain


def answer(capability='lowercase', payload=None):
    result = {'capability': capability, 'payload_json': json.dumps(payload or {})}
    return {'status': 'completed', 'output': [
        {'type': 'reasoning', 'summary': []},
        {'type': 'message', 'content': [{'type': 'output_text', 'text': json.dumps(result)}]}
    ]}


class OpenAIBrainTests(unittest.TestCase):
    def test_real_agent_consumes_model_proposed_intent_without_model_authorization(self):
        requests = []

        def fake_transport(body, key, timeout):
            requests.append((body, key, timeout))
            return answer('lowercase', {'text': 'TRILLIGENCE'})

        with Harness() as harness:
            harness.register(Capability('lowercase', needs=('text',), adds=('normalized',),
                handler=lambda p: p['text'].lower(),
                verifier=lambda p, r: r == p['text'].lower()), available=True)
            brain = OpenAIResponsesBrain(model='test-model', api_key='test-key', transport=fake_transport)
            report = Agent(harness, brain).run('normalized', facts={'text'})
            self.assertTrue(report.reached)
            self.assertEqual(report.steps[0].status, 'VERIFIED')
            body, key, timeout = requests[0]
            self.assertEqual(key, 'test-key')
            self.assertEqual(body['model'], 'test-model')
            self.assertEqual(body['store'], False)
            self.assertEqual(body['text']['format']['type'], 'json_schema')
            self.assertNotIn('test-key', json.dumps(body))

    def test_model_may_decline_without_executing(self):
        brain = OpenAIResponsesBrain(model='test-model', api_key='test-key',
            transport=lambda *_: answer('NONE'))
        self.assertIsNone(brain.propose(goal='x', facts=frozenset(), catalog=[{'name':'noop','status':'AVAILABLE','read_only':True}], history=()))

    def test_requires_api_key_before_request(self):
        with patch.dict(os.environ, {}, clear=True):
            brain = OpenAIResponsesBrain(model='test-model', transport=lambda *_: self.fail('network called'))
            with self.assertRaisesRegex(RuntimeError, 'OPENAI_API_KEY'):
                brain.propose(goal='x', facts=frozenset(), catalog=[{'name':'noop','status':'AVAILABLE','read_only':True}], history=())

    def test_invalid_model_payload_rejected(self):
        bad = {'status': 'completed', 'output': [{'type':'message', 'content': [
            {'type':'output_text', 'text':'{"capability":"lowercase","payload_json":"[]"}'}]}]}
        brain = OpenAIResponsesBrain(model='test-model', api_key='test-key',transport=lambda *_:bad)
        with self.assertRaisesRegex(ValueError, 'payload'):
            brain.propose(goal='x', facts=frozenset(), catalog=[{'name':'lowercase','status':'AVAILABLE','read_only':True}], history=())

    def test_external_api_is_fixed_and_not_controllable_by_model(self):
        from trilligence.openai_bridge import _post_openai
        from unittest.mock import patch as mock_patch
        captured = {}
        class FakeResponse:
            def __enter__(self): return self
            def __exit__(self, *_): pass
            def read(self): return json.dumps(answer('NONE')).encode()
        def fake_urlopen(request, timeout):
            captured['url'] = request.full_url
            captured['header'] = request.get_header('Authorization')
            captured['timeout'] = timeout
            return FakeResponse()
        with mock_patch('trilligence.openai_bridge.urlopen', fake_urlopen):
            result = _post_openai({'model':'test-model'}, 'local-key', 12)
        self.assertEqual(result['status'], 'completed')
        self.assertEqual(captured['url'], 'https://api.openai.com/v1/responses')
        self.assertEqual(captured['header'], 'Bearer local-key')
        self.assertEqual(captured['timeout'], 12)

    def test_mutation_remains_blocked_even_when_model_proposes_it(self):
        called=[]
        with Harness() as harness:
            harness.register(Capability('publish', adds=('published',), read_only=False,
                handler=lambda p: called.append(True),verifier=lambda p, r: bool(called)), available=True)
            brain=OpenAIResponsesBrain(model='test-model',api_key='test-key',
                transport=lambda *_:answer('publish',{'approve_side_effects':True}))
            report=Agent(harness,brain).run('published',facts=set())
            self.assertEqual(report.stop_reason,'BLOCKED')
            self.assertEqual(called,[])

    def test_no_network_if_no_executable_tools(self):
        brain=OpenAIResponsesBrain(model='test-model',api_key='test-key',
            transport=lambda *_:self.fail('should not call model'))
        self.assertIsNone(brain.propose(goal='nothing', facts=frozenset(), catalog=[
            {'name':'offline','status':'DECLARED','read_only':True}],history=()))

if __name__ == '__main__': unittest.main()
