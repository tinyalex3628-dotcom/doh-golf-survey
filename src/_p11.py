p='runtime-v3.js'; s=open(p,encoding='utf-8').read()
old = "  'pc1'() {"
new = """  'pc1'() {
    // '이게 다야?' 하고 실망하는 걸 막는 한 줄. 둘의 차이를 바로 볼 수 있게 잇는다.
    onSel('[data-pc-fb]', () => go('cx'));"""
assert s.count(old)==1
open(p,'w',encoding='utf-8').write(s.replace(old,new)); print('  ✓ pc1 → cx 배선')
