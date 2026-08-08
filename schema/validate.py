#!/usr/bin/env python3
"""
DOH Vision JSON Contract — validator
====================================
Validates a Vision JSON instance against `doh.vision.v1.schema.json`.

Two modes, automatic:
  1. If `jsonschema` is installed (server/CI) -> full JSON-Schema Draft 2020-12
     validation.
  2. Otherwise (offline / no deps, e.g. 사지방/Colab-less box) -> a small built-in
     interpreter that reads the SAME schema file and checks the keywords the
     contract uses. No hand-duplicated rules -> the schema stays the single
     source of truth and the two modes cannot drift.

Usage
-----
  python validate.py                      # self-test: schema + example
  python validate.py instance.json        # validate one instance
  python validate.py a.json b.json ...     # validate several

Exit code 0 = all valid, 1 = any invalid / error.
"""
import sys, os, json, re

HERE = os.path.dirname(os.path.abspath(__file__))
SCHEMA_PATH = os.path.join(HERE, "doh.vision.v1.schema.json")
EXAMPLE_PATH = os.path.join(HERE, "doh.vision.v1.example.json")


def load(path):
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


# ---------------------------------------------------------------------------
# Mode 1: real jsonschema, if available
# ---------------------------------------------------------------------------
def validate_with_jsonschema(instance, schema):
    import jsonschema  # type: ignore
    validator = jsonschema.Draft202012Validator(schema)
    return ["/" + "/".join(map(str, e.path)) + ": " + e.message
            for e in sorted(validator.iter_errors(instance), key=lambda e: list(e.path))]


# ---------------------------------------------------------------------------
# Mode 2: built-in interpreter (subset of Draft 2020-12 used by this contract)
# ---------------------------------------------------------------------------
_TYPE_OK = {
    "string": lambda v: isinstance(v, str),
    "number": lambda v: isinstance(v, (int, float)) and not isinstance(v, bool),
    "integer": lambda v: isinstance(v, int) and not isinstance(v, bool),
    "boolean": lambda v: isinstance(v, bool),
    "object": lambda v: isinstance(v, dict),
    "array": lambda v: isinstance(v, list),
    "null": lambda v: v is None,
}


def _resolve(ref, root):
    assert ref.startswith("#/"), "only local refs supported: " + ref
    node = root
    for part in ref[2:].split("/"):
        node = node[part]
    return node


def _check(inst, sch, root, path, errs):
    if not isinstance(sch, dict):
        return
    if "$ref" in sch:
        _check(inst, _resolve(sch["$ref"], root), root, path, errs)
        return

    # type
    if "type" in sch:
        types = sch["type"] if isinstance(sch["type"], list) else [sch["type"]]
        if not any(_TYPE_OK[t](inst) for t in types):
            errs.append(f"{path}: expected type {types}, got {type(inst).__name__}")
            return

    # const / enum
    if "const" in sch and inst != sch["const"]:
        errs.append(f"{path}: must equal {sch['const']!r}, got {inst!r}")
    if "enum" in sch and inst not in sch["enum"]:
        errs.append(f"{path}: {inst!r} not in enum {sch['enum']}")

    # numbers
    if isinstance(inst, (int, float)) and not isinstance(inst, bool):
        if "minimum" in sch and inst < sch["minimum"]:
            errs.append(f"{path}: {inst} < minimum {sch['minimum']}")
        if "maximum" in sch and inst > sch["maximum"]:
            errs.append(f"{path}: {inst} > maximum {sch['maximum']}")
        if "exclusiveMinimum" in sch and inst <= sch["exclusiveMinimum"]:
            errs.append(f"{path}: {inst} <= exclusiveMinimum {sch['exclusiveMinimum']}")

    # strings
    if isinstance(inst, str):
        if "minLength" in sch and len(inst) < sch["minLength"]:
            errs.append(f"{path}: string shorter than minLength {sch['minLength']}")
        if "pattern" in sch and not re.search(sch["pattern"], inst):
            errs.append(f"{path}: {inst!r} does not match /{sch['pattern']}/")

    # objects
    if isinstance(inst, dict):
        for req in sch.get("required", []):
            if req not in inst:
                errs.append(f"{path}: missing required property '{req}'")
        props = sch.get("properties", {})
        addl = sch.get("additionalProperties", True)
        for k, v in inst.items():
            if k in props:
                _check(v, props[k], root, f"{path}/{k}", errs)
            elif addl is False:
                errs.append(f"{path}: additional property '{k}' not allowed")

    # arrays
    if isinstance(inst, list):
        if "minItems" in sch and len(inst) < sch["minItems"]:
            errs.append(f"{path}: fewer than minItems {sch['minItems']}")
        if "maxItems" in sch and len(inst) > sch["maxItems"]:
            errs.append(f"{path}: more than maxItems {sch['maxItems']}")
        for i, psch in enumerate(sch.get("prefixItems", [])):
            if i < len(inst):
                _check(inst[i], psch, root, f"{path}/{i}", errs)
        if "items" in sch:
            start = len(sch.get("prefixItems", []))
            for i in range(start, len(inst)):
                _check(inst[i], sch["items"], root, f"{path}/{i}", errs)


def validate_builtin(instance, schema):
    errs = []
    _check(instance, schema, schema, "", errs)
    return errs


# ---------------------------------------------------------------------------
def validate(instance, schema):
    try:
        import jsonschema  # noqa: F401
        return validate_with_jsonschema(instance, schema), "jsonschema"
    except ImportError:
        return validate_builtin(instance, schema), "builtin"


def _report(label, errs, engine):
    if errs:
        print(f"  ✗ {label}  [{engine}]  ({len(errs)} error(s))")
        for e in errs:
            print(f"      {e}")
        return False
    print(f"  ✓ {label}  [{engine}]")
    return True


def main(argv):
    schema = load(SCHEMA_PATH)
    targets = argv[1:] or [EXAMPLE_PATH]
    if not argv[1:]:
        print("DOH Vision Contract self-test (schema + canonical example)")
    ok = True
    for path in targets:
        try:
            inst = load(path)
        except Exception as e:
            print(f"  ✗ {path}  (load error: {e})")
            ok = False
            continue
        errs, engine = validate(inst, schema)
        ok &= _report(os.path.basename(path), errs, engine)
    print("RESULT:", "PASS" if ok else "FAIL")
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main(sys.argv))
