"""The result each task kind accepts (JSON Schema, draft 2020-12), checked before anything is applied
(docs/adr/0017-agent-api.md). `GET /api/agent/schemas/<kind>` serves them, so a skill can show the shape.

The schemas follow site/SCHEMA.md where they describe content (an event's keys and limits, a cite's `t`/`u`/`k`),
and the old CLI results where they describe a decision, so the jobs that read results (`process` reads a write_event
task's `result.entry`) work unchanged.
"""

from jsonschema import Draft202012Validator

SLUG = {"type": "string", "pattern": r"^[a-z0-9][a-z0-9-]{1,98}$"}
HTTPS = {"type": "string", "pattern": r"^https://", "maxLength": 1000}
KIND = {"enum": ["primary", "textbook", "paper", "museum", "archive", "reference", "encyclopedia", "news", "data"]}
EXCERPT = {"type": "string", "maxLength": 400, "description": "At most 25 words, copied from the page."}
NOTE = {"type": "string", "maxLength": 2000}

CITE = {
    "type": "object", "additionalProperties": False, "required": ["t", "u"],
    "properties": {"t": {"type": "string", "minLength": 1, "maxLength": 500}, "u": HTTPS, "k": KIND, "excerpt": EXCERPT,
                   "method": {"enum": ["agent_read", "browser_read"]}},
}
GEO = {
    "type": "object", "additionalProperties": False, "required": ["scope"],
    "properties": {"scope": {"enum": ["place", "region", "global"]}, "lat": {"type": "number", "minimum": -90, "maximum": 90},
                   "lon": {"type": "number", "minimum": -180, "maximum": 180}, "r": {"type": "number", "exclusiveMinimum": 0},
                   "label": {"type": "string", "maxLength": 300}, "src": HTTPS},
}
EVENT = {
    "type": "object", "additionalProperties": False, "required": ["id", "branch", "y", "when", "title", "text", "imp", "cites"],
    "properties": {
        "id": SLUG, "branch": SLUG, "y": {"type": "number"}, "end": {"type": "number"},
        "when": {"type": "string", "minLength": 1, "maxLength": 200},
        "title": {"type": "string", "minLength": 1, "maxLength": 70},
        "text": {"type": "string", "minLength": 1, "maxLength": 320},
        "imp": {"enum": [1, 2, 3]}, "link": SLUG,
        "cites": {"type": "array", "minItems": 1, "maxItems": 12, "items": CITE},
        "geo": GEO,
        "after": {**SLUG, "description": "Place it just after this event in the snapshot order (default: last)."},
    },
}

RESULTS = {
    "write_event": {
        "type": "object", "additionalProperties": False, "required": ["decision"],
        "properties": {
            "decision": {"enum": ["written", "duplicate", "rejected"]},
            "event": EVENT, "entry": {**SLUG, "description": "duplicate: the existing event that covers the story."},
            "sources_read": {"type": "array", "items": HTTPS, "maxItems": 50}, "note": NOTE,
        },
        "allOf": [
            {"if": {"properties": {"decision": {"const": "written"}}}, "then": {"required": ["event"]}},
            {"if": {"properties": {"decision": {"const": "duplicate"}}}, "then": {"required": ["entry"]}},
            {"if": {"properties": {"decision": {"const": "rejected"}}}, "then": {"required": ["note"]}},
        ],
    },
    "audit": {
        "type": "object", "additionalProperties": False, "required": ["events"],
        "properties": {"events": {"type": "array", "maxItems": 30, "items": EVENT}, "note": NOTE},
    },
    "verify_claim": {
        "type": "object", "additionalProperties": False, "required": ["claim", "evidence"],
        "properties": {
            "claim": {"type": "integer"},
            "evidence": {"type": "array", "maxItems": 30, "items": {
                "type": "object", "additionalProperties": False, "required": ["url", "stance"],
                "properties": {
                    "claim": {"type": "integer", "description": "The claim or one of its atomic parts (default: the task's claim)."},
                    "url": HTTPS, "title": {"type": "string", "maxLength": 500},
                    "stance": {"enum": ["supports", "partial", "conflicts", "unrelated"]},
                    "excerpt": EXCERPT, "method": {"enum": ["agent_read", "browser_read"]},
                    "found": {"type": "object", "description": 'What the source says when it differs, e.g. {"y": 1951.3, "when": "April 1951"}.'},
                },
            }},
            "suggestions": {"type": "object", "additionalProperties": False, "properties": {
                "accepted": {"type": "array", "items": {"type": "integer"}}, "rejected": {"type": "array", "items": {"type": "integer"}}}},
            "proposed_text": {"type": "string", "maxLength": 320, "description": "A corrected entry text for the owner to apply (never applied here)."},
            "note": NOTE,
        },
    },
    "review_branch_proposal": {
        "type": "object", "additionalProperties": False, "required": ["decision", "proposal", "note"],
        "properties": {
            "decision": {"enum": ["accept", "reject"]}, "proposal": {"type": "integer"},
            "operations": {"type": "array", "items": {"type": "object", "required": ["op"]}}, "note": NOTE,
        },
        "allOf": [{"if": {"properties": {"decision": {"const": "accept"}}}, "then": {"required": ["operations"]}}],
    },
    "fill_gap": {
        "type": "object", "additionalProperties": False, "required": ["decision"],
        "properties": {
            "decision": {"enum": ["written", "nothing_notable"]},
            "events": {"type": "array", "minItems": 1, "maxItems": 3, "items": EVENT,
                       "description": "On the task's branch, each inside the task's window (y in it, or its span overlapping it)."},
            "sources_read": {"type": "array", "items": HTTPS, "maxItems": 50},
            "note": {**NOTE, "description": "nothing_notable: what you searched and read, and why nothing is notable or sourceable."},
        },
        "allOf": [
            {"if": {"properties": {"decision": {"const": "written"}}}, "then": {"required": ["events"]}},
            {"if": {"properties": {"decision": {"const": "nothing_notable"}}},
             "then": {"required": ["note"], "properties": {"note": {"minLength": 20}}, "not": {"required": ["events"]}}},
        ],
    },
    "map_branch_entities": {
        "type": "object", "additionalProperties": False, "required": ["branch", "entities"],
        "properties": {
            "branch": SLUG,
            "entities": {"type": "array", "maxItems": 20, "items": {
                "type": "object", "additionalProperties": False, "required": ["qid"],
                "properties": {"qid": {"type": "string", "pattern": r"^Q[1-9]\d*$"}, "role": {"type": "string", "maxLength": 40},
                               "label": {"type": "string", "maxLength": 300}}}},
            "note": NOTE,
        },
    },
}

for _s in RESULTS.values():
    Draft202012Validator.check_schema(_s)
_VALIDATORS = {k: Draft202012Validator(v) for k, v in RESULTS.items()}


def errors(kind: str, result) -> list[str]:
    """Schema problems with a result, as "path: message". Unknown kinds can't be completed over the API."""
    v = _VALIDATORS.get(kind)
    if v is None:
        return [f"no result schema for {kind!r}: complete it with `manage.py tasks complete` (the owner's CLI)"]
    out = []
    for e in sorted(v.iter_errors(result), key=lambda e: list(e.absolute_path)):
        path = "/".join(str(p) for p in e.absolute_path) or "(result)"
        out.append(f"{path}: {e.message[:300]}")
    return out
