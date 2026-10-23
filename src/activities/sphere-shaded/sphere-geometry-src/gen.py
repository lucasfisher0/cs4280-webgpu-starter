import math
R = 2.3
X = (0.866, -0.1545); Y = (0.0, 0.9511); Z = (-0.5, -0.2676)
D = (0.4755, 0.3090, 0.8236)  # direction toward the viewer
def proj(p):
    return (p[0]*X[0]+p[1]*Y[0]+p[2]*Z[0], p[0]*X[1]+p[1]*Y[1]+p[2]*Z[1])
def sph(t, f, r=R):
    t, f = math.radians(t), math.radians(f)
    return (r*math.sin(t)*math.sin(f), r*math.cos(t), r*math.sin(t)*math.cos(f))
def vis(p): return p[0]*D[0]+p[1]*D[1]+p[2]*D[2] >= -1e-9
def c(p): q = proj(p); return f"({q[0]:.3f},{q[1]:.3f})"
def curve(pts, style_vis, style_hid=None):
    out, seg, cur = [], [], None
    for p in pts:
        v = vis(p)
        if cur is None or v == cur: seg.append(p)
        else:
            out.append((cur, seg)); seg = [seg[-1], p]
        cur = v
    out.append((cur, seg))
    s = ""
    for v, sg in out:
        st = style_vis if v else style_hid
        if st and len(sg) > 1:
            s += f"\\draw[{st}] " + " -- ".join(c(p) for p in sg) + ";\n"
    return s
N = 180
body = ""
LAT, LON = 6, 12
# grid lines
for k in range(1, LAT):
    t = k*180/LAT
    pts = [sph(t, 360*s/N) for s in range(N+1)]
    body += curve(pts, "grid", "hgrid" if k == LAT//2 else None)
for k in range(LON):
    f = k*360/LON
    pts = [sph(180*s/N, f) for s in range(N+1)]
    body += curve(pts, "grid")
# highlighted cell i=3, j=1
i, j = 3, 1
t0, t1 = i*180/LAT, (i+1)*180/LAT; f0, f1 = j*360/LON, (j+1)*360/LON
n = 20
cell = [sph(t0, f0+(f1-f0)*s/n) for s in range(n+1)] + [sph(t0+(t1-t0)*s/n, f1) for s in range(n+1)] \
     + [sph(t1, f1-(f1-f0)*s/n) for s in range(n+1)] + [sph(t1-(t1-t0)*s/n, f0) for s in range(n+1)]
cellpath = "\\fill[cellfill] " + " -- ".join(c(p) for p in cell) + " -- cycle;\n"
diag = [sph(t0+(t1-t0)*s/n, f0+(f1-f0)*s/n) for s in range(n+1)]
body += "\\draw[celldiag] " + " -- ".join(c(p) for p in diag) + ";\n"
for name, p, anc in [("a", sph(t0, f0), "north east"), ("b", sph(t0, f1), "north west"),
                     ("c", sph(t1, f0), "south east"), ("d", sph(t1, f1), "south west")]:
    body += f"\\fill[cellpt] {c(p)} circle (1.1pt) node[anchor={anc},inner sep=1pt,font=\\scriptsize\\itshape] {{{name}}};\n"
# axes
for v, lab, anc in [((1,0,0), "x", "north west"), ((0,1,0), "y", "south"), ((0,0,1), "z", "north east")]:
    inner = tuple(R*a for a in v); outer = tuple(1.45*R*a for a in v)
    body += f"\\draw[axisin] (0,0) -- {c(inner)};\n"
    if lab == "z" or lab == "x":
        body += f"\\draw[axis] {c(inner)} -- {c(outer)} node[anchor={anc}] {{${lab}$}};\n"
    else:
        body += f"\\draw[axis] {c(tuple(R*a for a in v))} -- {c(outer)} node[anchor={anc}] {{${lab}$}};\n"
# point P
th, ph = 48, 52
P = sph(th, ph)
Q = (P[0], 0, P[2])
body += f"\\draw[helper] {c(P)} -- {c(Q)};\n"
body += f"\\draw[helper] (0,0) -- {c(Q)} ;\n"
body += f"\\draw[radius] (0,0) -- node[pos=0.3, below right=-1pt, font=\\small] {{$r$}} {c(P)};\n"
# theta arc
arc = [sph(th*s/n, ph, 0.55*R) for s in range(n+1)]
body += "\\draw[thetaarc,->] " + " -- ".join(c(p) for p in arc) + ";\n"
m = proj(sph(th/2, ph, 0.72*R))
body += f"\\node[thetacol] at ({m[0]:.3f},{m[1]:.3f}) {{$\\theta$}};\n"
arc = [(0.5*R*math.sin(math.radians(ph*s/n)), 0, 0.5*R*math.cos(math.radians(ph*s/n))) for s in range(n+1)]
body += "\\draw[phiarc,->] " + " -- ".join(c(p) for p in arc) + ";\n"
m = proj((0.66*R*math.sin(math.radians(ph/2)), 0, 0.66*R*math.cos(math.radians(ph/2))))
body += f"\\node[phicol] at ({m[0]:.3f},{m[1]:.3f}) {{$\\varphi$}};\n"
# height label and horizontal distance label
mq = proj(((P[0]+Q[0])/2, (P[1]+Q[1])/2, (P[2]+Q[2])/2))
body += f"\\node[font=\\scriptsize, anchor=west] at ({mq[0]+0.05:.3f},{mq[1]:.3f}) {{$r\\cos\\theta$}};\n"
mo = proj((Q[0]*0.6, 0, Q[2]*0.6))
body += f"\\node[font=\\scriptsize, anchor=north west] at ({mo[0]:.3f},{mo[1]-0.02:.3f}) {{$r\\sin\\theta$}};\n"
body += f"\\fill[black] {c(P)} circle (1.8pt) node[anchor=south west, inner sep=2pt] {{$P$}};\n"
body += f"\\fill[black] (0,0) circle (1.2pt) node[anchor=north east, inner sep=1.5pt, font=\\small] {{$O$}};\n"
# poles
body += f"\\fill[polecol] {c(sph(0,0))} circle (1.6pt);\n"
body += f"\\node[font=\\scriptsize, anchor=south east] at {c(sph(0,0))} {{north pole $\\theta{{=}}0$}};\n"
body += f"\\fill[polecol] {c(sph(180,0))} circle (1.6pt) node[anchor=north, font=\\scriptsize] {{south pole $\\theta{{=}}\\pi$}};\n"

fig1 = f"""\\begin{{tikzpicture}}[alt={{\\figonealt}},
  grid/.style={{gray!45, line width=0.35pt}},
  hgrid/.style={{gray!45, dashed, line width=0.35pt}},
  axis/.style={{-{{Stealth[length=5pt]}}, line width=0.7pt}},
  axisin/.style={{gray!70, line width=0.4pt, dash pattern=on 1.5pt off 1.5pt}},
  helper/.style={{dashed, line width=0.6pt, black!70}},
  radius/.style={{line width=1pt, black}},
  thetaarc/.style={{thetac, line width=0.9pt}}, thetacol/.style={{thetac}},
  phiarc/.style={{phic, line width=0.9pt}}, phicol/.style={{phic}},
  cellfill/.style={{fill=cellc!30}}, celldiag/.style={{cellc, line width=0.5pt}},
  cellpt/.style={{cellc!80!black}}, polecol/.style={{black}}]
\\shade[ball color=gray!6, opacity=0.9] (0,0) circle ({R});
{cellpath}{body}\\draw[line width=0.8pt] (0,0) circle ({R});
\\end{{tikzpicture}}"""
open("fig1.tex", "w").write(fig1)
