"""Single-process Blender 5.2.2 LTS Headless EEVEE batch renderer for DCC Döner Catering Club (F5).

Renders all 14 bespoke architectural & culinary plates in one persistent Blender process:
  - BLENDER_EEVEE (use_raytracing=False, taa_render_samples=24, use_shadows=True)
  - AgX color management (AgX - Medium High Contrast)
  - Blender 5.x CompositorNodeTree with Fog Glow glare
  - Zero baked text/UI, 42-52mm pull-back safe framing, bmesh-sculpted rotisserie cones
"""

from __future__ import annotations

import math
import os
import random
import sys
import bpy
import bmesh
from mathutils import Euler, Vector


def _clear_scene() -> None:
    for obj in list(bpy.data.objects):
        bpy.data.objects.remove(obj, do_unlink=True)
    for datablock in (
        bpy.data.meshes,
        bpy.data.lights,
        bpy.data.cameras,
        bpy.data.materials,
        bpy.data.curves,
    ):
        for item in list(datablock):
            datablock.remove(item, do_unlink=True)


def _setup_render_engine(scene: bpy.types.Scene) -> None:
    scene.render.engine = "BLENDER_EEVEE"
    scene.eevee.taa_render_samples = 24
    scene.eevee.use_raytracing = False
    scene.eevee.use_shadows = True
    scene.render.resolution_percentage = 100
    scene.render.film_transparent = False
    scene.render.image_settings.file_format = "PNG"
    scene.render.image_settings.color_mode = "RGB"
    scene.render.image_settings.color_depth = "8"

    scene.display_settings.display_device = "sRGB"
    scene.view_settings.view_transform = "AgX"
    scene.view_settings.look = "AgX - Medium High Contrast"
    scene.view_settings.exposure = 0.35

    # Studio gradient world (deep obsidian-slate horizon)
    world = bpy.data.worlds.new("DCCStudioWorld")
    scene.world = world
    wt = world.node_tree
    wt.nodes.clear()
    w_out = wt.nodes.new("ShaderNodeOutputWorld")
    w_bg = wt.nodes.new("ShaderNodeBackground")
    w_tc = wt.nodes.new("ShaderNodeTexCoord")
    w_sep = wt.nodes.new("ShaderNodeSeparateXYZ")
    w_ramp = wt.nodes.new("ShaderNodeValToRGB")
    w_ramp.color_ramp.elements[0].position = 0.15
    w_ramp.color_ramp.elements[0].color = (0.008, 0.007, 0.006, 1.0)
    w_ramp.color_ramp.elements[1].position = 0.85
    w_ramp.color_ramp.elements[1].color = (0.045, 0.036, 0.028, 1.0)
    w_bg.inputs[1].default_value = 1.15
    wt.links.new(w_tc.outputs["Generated"], w_sep.inputs["Vector"])
    wt.links.new(w_sep.outputs["Z"], w_ramp.inputs["Fac"])
    wt.links.new(w_ramp.outputs["Color"], w_bg.inputs["Color"])
    wt.links.new(w_bg.outputs["Background"], w_out.inputs["Surface"])

    # Blender 5.2 CompositorNodeTree with Fog Glow
    nt = bpy.data.node_groups.new("DCCComp5", "CompositorNodeTree")
    scene.compositing_node_group = nt
    nt.interface.new_socket(name="Image", in_out="OUTPUT", socket_type="NodeSocketColor")
    rl = nt.nodes.new("CompositorNodeRLayers")
    glare = nt.nodes.new("CompositorNodeGlare")
    glare.inputs["Type"].default_value = "Fog Glow"
    glare.inputs["Quality"].default_value = "Medium"
    glare.inputs["Threshold"].default_value = 0.92
    glare.inputs["Strength"].default_value = 0.36
    glare.inputs["Size"].default_value = 7.0
    out_node = nt.nodes.new("NodeGroupOutput")
    nt.links.new(rl.outputs["Image"], glare.inputs["Image"])
    nt.links.new(glare.outputs["Image"], out_node.inputs[0])


def _new_mat(name: str):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    bsdf = nt.nodes.get("Principled BSDF")
    return m, nt, bsdf


def _build_materials() -> dict[str, bpy.types.Material]:
    mats = {}

    # Matte Obsidian Steel (anodized dark metal)
    m_obs, nt, bsdf = _new_mat("DCC_Obsidian")
    bsdf.inputs["Base Color"].default_value = (0.018, 0.016, 0.015, 1.0)
    bsdf.inputs["Metallic"].default_value = 0.82
    bsdf.inputs["Roughness"].default_value = 0.28
    bsdf.inputs["Coat Weight"].default_value = 0.45
    bsdf.inputs["Coat Roughness"].default_value = 0.08
    mats["obsidian"] = m_obs

    # Satin Charcoal Counter / Basalt Floor
    m_floor, nt, bsdf = _new_mat("DCC_Basalt")
    bsdf.inputs["Base Color"].default_value = (0.014, 0.013, 0.012, 1.0)
    bsdf.inputs["Metallic"].default_value = 0.12
    bsdf.inputs["Roughness"].default_value = 0.34
    noise_f = nt.nodes.new("ShaderNodeTexNoise")
    noise_f.inputs["Scale"].default_value = 18.0
    noise_f.inputs["Detail"].default_value = 6.0
    bump_f = nt.nodes.new("ShaderNodeBump")
    bump_f.inputs["Strength"].default_value = 0.08
    nt.links.new(noise_f.outputs["Fac"], bump_f.inputs["Height"])
    nt.links.new(bump_f.outputs["Normal"], bsdf.inputs["Normal"])
    mats["basalt"] = m_floor

    # Brushed Burnished Brass (#D49B54)
    m_brass, nt, bsdf = _new_mat("DCC_Brass")
    bsdf.inputs["Base Color"].default_value = (0.76, 0.50, 0.21, 1.0)
    bsdf.inputs["Metallic"].default_value = 1.0
    bsdf.inputs["Roughness"].default_value = 0.20
    bsdf.inputs["Coat Weight"].default_value = 0.25
    bsdf.inputs["Coat Roughness"].default_value = 0.08
    mats["brass"] = m_brass

    # Brushed Stainless Steel
    m_steel, _, bsdf = _new_mat("DCC_Steel")
    bsdf.inputs["Base Color"].default_value = (0.58, 0.59, 0.61, 1.0)
    bsdf.inputs["Metallic"].default_value = 1.0
    bsdf.inputs["Roughness"].default_value = 0.24
    mats["steel"] = m_steel

    # Warm Bone Ceramic / Travertine (#F3ECE0)
    m_bone, _, bsdf = _new_mat("DCC_Bone")
    bsdf.inputs["Base Color"].default_value = (0.88, 0.83, 0.74, 1.0)
    bsdf.inputs["Metallic"].default_value = 0.0
    bsdf.inputs["Roughness"].default_value = 0.42
    mats["bone"] = m_bone

    # Smoked Fresnel Glass (noise-free BLENDED)
    m_glass, nt_g, bsdf_g = _new_mat("DCC_FresnelGlass")
    m_glass.surface_render_method = "BLENDED"
    bsdf_g.inputs["Base Color"].default_value = (0.90, 0.94, 0.96, 1.0)
    bsdf_g.inputs["Metallic"].default_value = 0.05
    bsdf_g.inputs["Roughness"].default_value = 0.04
    bsdf_g.inputs["Coat Weight"].default_value = 1.0
    bsdf_g.inputs["Coat Roughness"].default_value = 0.02
    lw = nt_g.nodes.new("ShaderNodeLayerWeight")
    lw.inputs["Blend"].default_value = 0.32
    mul = nt_g.nodes.new("ShaderNodeMath")
    mul.operation = "MULTIPLY"
    mul.inputs[1].default_value = 0.58
    add = nt_g.nodes.new("ShaderNodeMath")
    add.operation = "ADD"
    add.inputs[1].default_value = 0.03
    nt_g.links.new(lw.outputs["Fresnel"], mul.inputs[0])
    nt_g.links.new(mul.outputs["Value"], add.inputs[0])
    nt_g.links.new(add.outputs["Value"], bsdf_g.inputs["Alpha"])
    mats["glass"] = m_glass

    # Glowing Radiant Burner Panel
    m_burner, _, bsdf = _new_mat("DCC_RadiantBurner")
    bsdf.inputs["Base Color"].default_value = (0.95, 0.28, 0.05, 1.0)
    bsdf.inputs["Emission Color"].default_value = (1.0, 0.30, 0.06, 1.0)
    bsdf.inputs["Emission Strength"].default_value = 7.5
    mats["burner"] = m_burner

    # Glowing Charcoal Bed Ember
    m_ember, nt, bsdf = _new_mat("DCC_CharcoalEmber")
    bsdf.inputs["Base Color"].default_value = (0.04, 0.02, 0.01, 1.0)
    bsdf.inputs["Roughness"].default_value = 0.85
    noise_e = nt.nodes.new("ShaderNodeTexNoise")
    noise_e.inputs["Scale"].default_value = 12.0
    ramp_e = nt.nodes.new("ShaderNodeValToRGB")
    ramp_e.color_ramp.elements[0].position = 0.42
    ramp_e.color_ramp.elements[0].color = (0.02, 0.005, 0.002, 1.0)
    ramp_e.color_ramp.elements[1].position = 0.72
    ramp_e.color_ramp.elements[1].color = (1.0, 0.22, 0.03, 1.0)
    nt.links.new(noise_e.outputs["Fac"], ramp_e.inputs["Fac"])
    nt.links.new(ramp_e.outputs["Color"], bsdf.inputs["Emission Color"])
    bsdf.inputs["Emission Strength"].default_value = 4.5
    mats["ember"] = m_ember

    # Warm Candle / Stage Bulb Filament
    m_warm_glow, _, bsdf = _new_mat("DCC_WarmGlow")
    bsdf.inputs["Base Color"].default_value = (1.0, 0.68, 0.28, 1.0)
    bsdf.inputs["Emission Color"].default_value = (1.0, 0.62, 0.22, 1.0)
    bsdf.inputs["Emission Strength"].default_value = 6.0
    mats["warm_glow"] = m_warm_glow

    # Culinary Spit Shaders (distinct palette, layering & specular gloss)
    def make_meat_shader(
        key: str,
        dark_col: tuple,
        mid_col: tuple,
        light_col: tuple,
        wave_scale: float,
        noise_scale: float,
        roughness: float,
        bump_str: float,
        coat: float = 0.35,
    ):
        m, nt, bsdf = _new_mat(f"DCC_Meat_{key}")
        tc = nt.nodes.new("ShaderNodeTexCoord")
        wave = nt.nodes.new("ShaderNodeTexWave")
        wave.wave_type = "BANDS"
        wave.bands_direction = "Z"
        wave.inputs["Scale"].default_value = wave_scale
        wave.inputs["Distortion"].default_value = 5.5
        wave.inputs["Detail"].default_value = 4.0

        noise = nt.nodes.new("ShaderNodeTexNoise")
        noise.inputs["Scale"].default_value = noise_scale
        noise.inputs["Detail"].default_value = 7.0
        noise.inputs["Roughness"].default_value = 0.65

        math_mix = nt.nodes.new("ShaderNodeMath")
        math_mix.operation = "MULTIPLY_ADD"
        math_mix.inputs[1].default_value = 0.62
        nt.links.new(tc.outputs["Object"], wave.inputs["Vector"])
        nt.links.new(tc.outputs["Object"], noise.inputs["Vector"])
        nt.links.new(wave.outputs["Fac"], math_mix.inputs[0])
        nt.links.new(noise.outputs["Fac"], math_mix.inputs[2])

        ramp = nt.nodes.new("ShaderNodeValToRGB")
        ramp.color_ramp.elements[0].position = 0.25
        ramp.color_ramp.elements[0].color = (*dark_col, 1.0)
        e_mid = ramp.color_ramp.elements.new(0.58)
        e_mid.color = (*mid_col, 1.0)
        ramp.color_ramp.elements[2].position = 0.92
        ramp.color_ramp.elements[2].color = (*light_col, 1.0)

        bump = nt.nodes.new("ShaderNodeBump")
        bump.inputs["Strength"].default_value = bump_str
        nt.links.new(math_mix.outputs["Value"], ramp.inputs["Fac"])
        nt.links.new(math_mix.outputs["Value"], bump.inputs["Height"])
        nt.links.new(ramp.outputs["Color"], bsdf.inputs["Base Color"])
        nt.links.new(bump.outputs["Normal"], bsdf.inputs["Normal"])

        bsdf.inputs["Roughness"].default_value = roughness
        bsdf.inputs["Coat Weight"].default_value = coat
        bsdf.inputs["Coat Roughness"].default_value = 0.22
        bsdf.inputs["Subsurface Weight"].default_value = 0.10
        mats[key] = m

    # 1. Yaprak Beef: Deep mahogany Maillard sear + marbled dark steak bands
    make_meat_shader(
        "yaprak",
        dark_col=(0.045, 0.015, 0.008),
        mid_col=(0.21, 0.065, 0.028),
        light_col=(0.42, 0.18, 0.09),
        wave_scale=16.0,
        noise_scale=9.5,
        roughness=0.34,
        bump_str=0.45,
        coat=0.42,
    )
    # 2. Classic Kalb: Golden-caramel fine-grain veal & beef
    make_meat_shader(
        "kalb",
        dark_col=(0.09, 0.035, 0.012),
        mid_col=(0.34, 0.16, 0.06),
        light_col=(0.56, 0.34, 0.16),
        wave_scale=28.0,
        noise_scale=15.0,
        roughness=0.40,
        bump_str=0.28,
        coat=0.32,
    )
    # 3. Chicken: Saffron-paprika & sumac bright golden amber glaze
    make_meat_shader(
        "chicken",
        dark_col=(0.14, 0.04, 0.008),
        mid_col=(0.55, 0.22, 0.035),
        light_col=(0.78, 0.44, 0.10),
        wave_scale=12.0,
        noise_scale=11.0,
        roughness=0.30,
        bump_str=0.38,
        coat=0.48,
    )
    # 4. Vegan Seitan: Charred herb-crusted emerald/sumac botanical stack
    make_meat_shader(
        "vegan",
        dark_col=(0.04, 0.06, 0.025),
        mid_col=(0.14, 0.22, 0.09),
        light_col=(0.30, 0.38, 0.16),
        wave_scale=14.0,
        noise_scale=13.0,
        roughness=0.46,
        bump_str=0.42,
        coat=0.25,
    )

    # Culinary Accent Materials (Condiments, Pide Bread, Concrete)
    m_pide, nt, bsdf = _new_mat("DCC_Pide")
    bsdf.inputs["Base Color"].default_value = (0.42, 0.24, 0.09, 1.0)
    bsdf.inputs["Roughness"].default_value = 0.78
    mats["pide"] = m_pide

    m_sumac, _, bsdf = _new_mat("DCC_Sumac")
    bsdf.inputs["Base Color"].default_value = (0.42, 0.05, 0.04, 1.0)
    bsdf.inputs["Roughness"].default_value = 0.55
    mats["sumac"] = m_sumac

    m_herb_oil, _, bsdf = _new_mat("DCC_HerbOil")
    bsdf.inputs["Base Color"].default_value = (0.10, 0.34, 0.14, 1.0)
    bsdf.inputs["Roughness"].default_value = 0.14
    bsdf.inputs["Coat Weight"].default_value = 0.8
    mats["herb_oil"] = m_herb_oil

    m_crema, _, bsdf = _new_mat("DCC_Crema")
    bsdf.inputs["Base Color"].default_value = (0.90, 0.86, 0.78, 1.0)
    bsdf.inputs["Roughness"].default_value = 0.26
    mats["crema"] = m_crema

    m_concrete, _, bsdf = _new_mat("DCC_Concrete")
    bsdf.inputs["Base Color"].default_value = (0.05, 0.05, 0.052, 1.0)
    bsdf.inputs["Roughness"].default_value = 0.68
    mats["concrete"] = m_concrete

    return mats


def _link_obj(obj: bpy.types.Object) -> bpy.types.Object:
    bpy.context.scene.collection.objects.link(obj)
    return obj


def _create_sculpted_spit_cone(
    name: str,
    mat: bpy.types.Material,
    location: tuple[float, float, float] = (0.0, 0.0, 0.0),
    height: float = 1.50,
    r_bottom: float = 0.19,
    r_top: float = 0.38,
    seed: int = 101,
    carve_facet: bool = True,
) -> bpy.types.Object:
    """Create an organic, bmesh-perturbed rotisserie cone with optional front-right carved slice."""
    rng = random.Random(seed)
    mesh = bpy.data.meshes.new(name)
    bm = bmesh.new()

    rings = 38
    segs = 48
    phase1 = rng.uniform(0.0, math.tau)
    phase2 = rng.uniform(0.0, math.tau)

    ring_verts = []
    for iz in range(rings + 1):
        t = iz / float(rings)
        z = -height * 0.5 + t * height
        # Inverted rotisserie bell profile (wider upper shoulder, gently rounded crown)
        shoulder = math.sin(min(t * 1.15, 1.0) * math.pi * 0.5)
        base_r = r_bottom + (r_top - r_bottom) * (shoulder ** 0.82)
        if t > 0.90:
            cap_t = (t - 0.90) / 0.10
            base_r *= math.sqrt(max(0.05, 1.0 - 0.72 * cap_t * cap_t))
        if t < 0.06:
            bot_t = (0.06 - t) / 0.06
            base_r *= (1.0 - 0.18 * bot_t * bot_t)

        # Organic layer overhang ripple along Z
        layer_ripple = 1.0 + 0.032 * math.sin(t * 42.0 + phase1) + 0.018 * math.cos(t * 74.0 + phase2)
        row = []
        for ia in range(segs):
            ang = (ia / float(segs)) * math.tau
            az_ripple = 1.0 + 0.024 * math.sin(ang * 5.0 + t * 18.0 + phase1) + 0.014 * math.cos(ang * 9.0 - t * 24.0)
            r = base_r * layer_ripple * az_ripple
            x = r * math.cos(ang)
            y = r * math.sin(ang)

            # Sculpted front-right carved slice plane (clean vertical cut revealing interior)
            if carve_facet and 0.15 < t < 0.82:
                # Carve angle facing front-right (-55 deg from -Y -> around -35 deg)
                carve_dir = Vector((0.52, -0.85, 0.0)).normalized()
                pos_xy = Vector((x, y, 0.0))
                proj = pos_xy.dot(carve_dir)
                max_slice_depth = base_r * 0.82
                if proj > max_slice_depth:
                    # Blend gently near top/bottom of slice
                    edge_t = min((t - 0.15) / 0.08, (0.82 - t) / 0.08, 1.0)
                    clamped_proj = proj - (proj - max_slice_depth) * edge_t
                    perp = pos_xy - carve_dir * proj
                    pos_xy = perp + carve_dir * clamped_proj
                    x, y = pos_xy.x, pos_xy.y

            v = bm.verts.new((x, y, z))
            row.append(v)
        ring_verts.append(row)

    bm.verts.ensure_lookup_table()
    for iz in range(rings):
        for ia in range(segs):
            ia_next = (ia + 1) % segs
            bm.faces.new((
                ring_verts[iz][ia],
                ring_verts[iz][ia_next],
                ring_verts[iz + 1][ia_next],
                ring_verts[iz + 1][ia],
            ))

    # Cap top & bottom
    bm.faces.new(list(reversed(ring_verts[0])))
    bm.faces.new(ring_verts[-1])
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    bm.to_mesh(mesh)
    bm.free()

    for p in mesh.polygons:
        p.use_smooth = True

    obj = bpy.data.objects.new(name, mesh)
    obj.location = location
    obj.data.materials.append(mat)
    return _link_obj(obj)


def _add_cylinder(name: str, r: float, depth: float, loc: tuple, mat: bpy.types.Material, segs: int = 48, rot=(0, 0, 0)):
    bpy.ops.mesh.primitive_cylinder_add(vertices=segs, radius=r, depth=depth, location=loc, rotation=rot)
    obj = bpy.context.active_object
    obj.name = name
    bpy.ops.object.shade_smooth()
    obj.data.materials.append(mat)
    return obj


def _add_box(name: str, size: tuple, loc: tuple, mat: bpy.types.Material, bevel: float = 0.015, rot=(0, 0, 0)):
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=loc, rotation=rot)
    obj = bpy.context.active_object
    obj.name = name
    obj.scale = size
    bpy.ops.object.transform_apply(scale=True)
    if bevel > 0:
        b = obj.modifiers.new("Bevel", "BEVEL")
        b.width = bevel
        b.segments = 3
    bpy.ops.object.shade_smooth()
    obj.data.materials.append(mat)
    return obj


def _add_rotisserie_hardware(
    prefix: str,
    center: tuple[float, float, float],
    mats: dict[str, bpy.types.Material],
    meat_mat: bpy.types.Material,
    seed: int = 101,
    include_housing: bool = True,
    spit_height: float = 1.48,
):
    cx, cy, cz = center
    # Vertical steel & brass skewer rod
    _add_cylinder(f"{prefix}_Skewer", 0.022, spit_height + 0.68, (cx, cy, cz + 0.04), mats["steel"])
    # Brass top finial crown + collar disc
    _add_cylinder(f"{prefix}_CrownDisc", 0.14, 0.035, (cx, cy, cz + spit_height * 0.5 + 0.12), mats["brass"])
    _add_cylinder(f"{prefix}_CrownFinial", 0.045, 0.14, (cx, cy, cz + spit_height * 0.5 + 0.24), mats["brass"])
    # Base drip tray & burner bed
    _add_cylinder(f"{prefix}_DripTray", 0.48, 0.055, (cx, cy, cz - spit_height * 0.5 - 0.12), mats["brass"])
    _add_cylinder(f"{prefix}_DripWell", 0.43, 0.025, (cx, cy, cz - spit_height * 0.5 - 0.09), mats["obsidian"])

    # Sculpted rotisserie meat cone
    _create_sculpted_spit_cone(
        f"{prefix}_SpitMeat",
        meat_mat,
        location=(cx, cy, cz + 0.02),
        height=spit_height,
        r_bottom=0.20,
        r_top=0.39,
        seed=seed,
    )

    if include_housing:
        # Architectural Obsidian & Brass Rotisserie Rear Housing
        _add_box(f"{prefix}_BackWall", (1.28, 0.22, spit_height + 0.72), (cx, cy + 0.62, cz + 0.04), mats["obsidian"], bevel=0.02)
        _add_box(f"{prefix}_LeftWing", (0.10, 0.72, spit_height + 0.72), (cx - 0.59, cy + 0.30, cz + 0.04), mats["obsidian"], bevel=0.015)
        _add_box(f"{prefix}_RightWing", (0.10, 0.72, spit_height + 0.72), (cx + 0.59, cy + 0.30, cz + 0.04), mats["obsidian"], bevel=0.015)
        # Brass vertical trim ribs
        _add_box(f"{prefix}_BrassTrimL", (0.028, 0.035, spit_height + 0.70), (cx - 0.59, cy - 0.05, cz + 0.04), mats["brass"], bevel=0.005)
        _add_box(f"{prefix}_BrassTrimR", (0.028, 0.035, spit_height + 0.70), (cx + 0.59, cy - 0.05, cz + 0.04), mats["brass"], bevel=0.005)
        # Top motor hood + brass trim fascia
        _add_box(f"{prefix}_Hood", (1.36, 1.05, 0.18), (cx, cy + 0.20, cz + spit_height * 0.5 + 0.44), mats["obsidian"], bevel=0.02)
        _add_box(f"{prefix}_HoodBrass", (1.38, 0.04, 0.045), (cx, cy - 0.32, cz + spit_height * 0.5 + 0.40), mats["brass"], bevel=0.005)
        # Radiant rear ceramic burner panels (3 warm glowing panels)
        for iz in (-0.42, 0.0, 0.42):
            _add_box(f"{prefix}_Burner_{iz}", (0.74, 0.035, 0.32), (cx, cy + 0.50, cz + iz + 0.02), mats["burner"], bevel=0.006)
        # Grounded recessed charcoal ember tray at base
        _add_box(f"{prefix}_EmberBed", (0.86, 0.36, 0.04), (cx, cy + 0.34, cz - spit_height * 0.5 - 0.12), mats["ember"], bevel=0.008)


def _add_station_counter(prefix: str, center: tuple, mats: dict, width: float = 2.45):
    cx, cy, cz = center
    # Matte obsidian base counter with architectural vertical ribs
    _add_box(f"{prefix}_CounterBody", (width, 1.15, 0.92), (cx, cy, cz + 0.46), mats["obsidian"], bevel=0.02)
    rib_count = 11
    for i in range(rib_count):
        rx = cx - width * 0.44 + (width * 0.88) * (i / (rib_count - 1))
        _add_box(f"{prefix}_Rib_{i}", (0.045, 0.04, 0.82), (rx, cy - 0.58, cz + 0.46), mats["obsidian"], bevel=0.006)
    # Brushed brass counter worktop lip & plinth kickplate
    _add_box(f"{prefix}_BrassTop", (width + 0.06, 1.21, 0.055), (cx, cy, cz + 0.94), mats["brass"], bevel=0.008)
    _add_box(f"{prefix}_KickBrass", (width + 0.02, 1.17, 0.06), (cx, cy, cz + 0.03), mats["brass"], bevel=0.005)
    # Tempered Fresnel sneeze guard glass on front
    _add_box(f"{prefix}_GlassGuard", (width - 0.18, 0.025, 0.54), (cx, cy - 0.52, cz + 1.24), mats["glass"], bevel=0.004)
    # Brass glass stanchions
    for sx in (cx - width * 0.42, cx + width * 0.42):
        _add_cylinder(f"{prefix}_Stanchion_{sx:.2f}", 0.018, 0.58, (sx, cy - 0.52, cz + 1.25), mats["brass"], segs=24)


def _add_club_trailer(prefix: str, center: tuple, mats: dict, rot_z_deg: float = 0.0):
    cx, cy, cz = center
    rig = bpy.data.objects.new(f"{prefix}_TrailerRig", None)
    rig.location = (cx, cy, cz)
    rig.rotation_euler = Euler((0.0, 0.0, math.radians(rot_z_deg)), "XYZ")
    _link_obj(rig)

    def link_rig(obj):
        obj.parent = rig
        return obj

    # Chassis & Wheels
    link_rig(_add_box(f"{prefix}_Chassis", (4.55, 2.05, 0.24), (0.0, 0.0, 0.42), mats["obsidian"], bevel=0.02))
    link_rig(_add_box(f"{prefix}_Drawbar", (1.20, 0.16, 0.12), (-2.75, 0.0, 0.42), mats["steel"], bevel=0.01))
    for wx in (0.45, 1.25):
        for wy in (-0.98, 0.98):
            link_rig(_add_cylinder(f"{prefix}_Wheel_{wx}_{wy}", 0.34, 0.22, (wx, wy, 0.34), mats["obsidian"], segs=36, rot=(math.radians(90), 0, 0)))
            link_rig(_add_cylinder(f"{prefix}_Rim_{wx}_{wy}", 0.20, 0.24, (wx, wy, 0.34), mats["brass"], segs=24, rot=(math.radians(90), 0, 0)))

    # Main Cabin Walls (back + sides + lower front + roof)
    link_rig(_add_box(f"{prefix}_BackWall", (4.40, 0.14, 2.25), (0.0, 0.92, 1.66), mats["obsidian"], bevel=0.025))
    link_rig(_add_box(f"{prefix}_LeftWall", (0.14, 1.98, 2.25), (-2.13, 0.0, 1.66), mats["obsidian"], bevel=0.025))
    link_rig(_add_box(f"{prefix}_RightWall", (0.14, 1.98, 2.25), (2.13, 0.0, 1.66), mats["obsidian"], bevel=0.025))
    link_rig(_add_box(f"{prefix}_LowerFront", (4.36, 0.16, 1.02), (0.0, -0.92, 1.04), mats["obsidian"], bevel=0.02))
    link_rig(_add_box(f"{prefix}_Roof", (4.48, 2.06, 0.16), (0.0, 0.0, 2.82), mats["obsidian"], bevel=0.03))
    # Brass architectural beltline & awning hatch raised open
    link_rig(_add_box(f"{prefix}_BrassBelt", (4.44, 2.04, 0.05), (0.0, 0.0, 1.54), mats["brass"], bevel=0.005))
    link_rig(_add_box(f"{prefix}_ServingShelf", (3.20, 0.38, 0.05), (0.0, -1.16, 1.50), mats["brass"], bevel=0.008))
    # Open Hatch Awning (tilted +32 deg outward)
    link_rig(_add_box(f"{prefix}_Awning", (3.60, 1.15, 0.08), (0.0, -1.42, 2.98), mats["obsidian"], bevel=0.015, rot=(math.radians(-26), 0, 0)))
    link_rig(_add_box(f"{prefix}_AwningWarm", (3.40, 0.08, 0.04), (0.0, -1.85, 3.16), mats["warm_glow"], bevel=0.005))
    # Interior steel counter + warm glow strips
    link_rig(_add_box(f"{prefix}_InteriorCounter", (3.90, 0.85, 0.90), (0.0, 0.40, 1.00), mats["steel"], bevel=0.01))
    # Two interior spits visible inside the hatch
    for sx, smat, sseed in ((-0.75, mats["yaprak"], 11), (0.75, mats["chicken"], 22)):
        spit = _create_sculpted_spit_cone(f"{prefix}_InSpit_{sx}", smat, location=(0, 0, 0), height=0.88, r_bottom=0.12, r_top=0.23, seed=sseed)
        spit.parent = rig
        spit.location = (sx, 0.25, 2.02)
        burner = _add_box(f"{prefix}_InBurner_{sx}", (0.45, 0.04, 0.72), (0, 0, 0), mats["burner"], bevel=0.005)
        burner.parent = rig
        burner.location = (sx, 0.56, 2.02)


def _add_area_light(name: str, loc: tuple, look_at: tuple, energy: float, color: tuple, size: float, size_y: float | None = None):
    ldata = bpy.data.lights.new(name=name, type="AREA")
    ldata.energy = energy
    ldata.color = color
    ldata.shape = "RECTANGLE" if size_y else "DISK"
    ldata.size = size
    if size_y:
        ldata.size_y = size_y
    lobj = bpy.data.objects.new(name=name, object_data=ldata)
    lobj.location = loc
    direction = Vector(look_at) - Vector(loc)
    lobj.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()
    return _link_obj(lobj)


def _add_camera(loc: tuple, look_at: tuple, lens_mm: float = 46.0, dof_target: tuple | None = None, fstop: float = 4.0):
    cdata = bpy.data.cameras.new("DCCCam")
    cdata.lens = lens_mm
    cdata.clip_end = 200.0
    if dof_target is not None:
        cdata.dof.use_dof = True
        cdata.dof.focus_distance = (Vector(dof_target) - Vector(loc)).length
        cdata.dof.aperture_fstop = fstop
    cobj = bpy.data.objects.new("DCCCam", cdata)
    cobj.location = loc
    direction = Vector(look_at) - Vector(loc)
    cobj.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()
    _link_obj(cobj)
    bpy.context.scene.camera = cobj
    return cobj


def _add_studio_backdrop(mats: dict, width: float = 28.0, depth: float = 28.0, z: float = 0.0):
    _add_box("Studio_Floor", (width, depth, 0.10), (0.0, 0.0, z - 0.05), mats["basalt"], bevel=0.0)


def _build_scene_shot(shot_id: str, mats: dict, scene: bpy.types.Scene):
    _add_studio_backdrop(mats)

    if shot_id == "hero-live-station":
        # Positioned right-of-center so left hero copy stays clean & dark
        _add_station_counter("HeroSt", (1.05, 0.0, 0.0), mats, width=2.55)
        _add_rotisserie_hardware("HeroSpit", (1.05, 0.20, 1.85), mats, mats["yaprak"], seed=41, include_housing=True, spit_height=1.35)
        # Architectural slate platter with carved meat ribbons on counter front
        _add_box("HeroPlatter", (0.72, 0.42, 0.03), (0.20, -0.25, 0.99), mats["obsidian"], bevel=0.008)
        _add_cylinder("HeroBowl1", 0.08, 0.05, (-0.28, -0.28, 1.00), mats["brass"], segs=24)
        _add_cylinder("HeroBowl2", 0.08, 0.05, (-0.48, -0.22, 1.00), mats["brass"], segs=24)
        _add_area_light("Key_Warm", (-3.8, -4.5, 3.8), (0.9, 0.0, 1.5), 720.0, (1.0, 0.64, 0.28), 2.4, 3.6)
        _add_area_light("Rim_Cool", (4.8, 3.4, 3.2), (1.0, 0.0, 1.6), 540.0, (0.48, 0.66, 0.92), 2.0, 4.0)
        _add_area_light("Top_Brass", (1.0, -0.8, 5.2), (1.0, 0.0, 1.4), 480.0, (1.0, 0.88, 0.72), 1.4, 3.2)
        _add_camera((-1.25, -7.25, 2.05), (0.35, 0.0, 1.48), lens_mm=42.0, dof_target=(1.05, 0.0, 1.5))

    elif shot_id == "hero-club-trailer":
        _add_club_trailer("HeroTr", (0.95, 0.5, 0.0), mats, rot_z_deg=-24.0)
        _add_area_light("Key_Dusk", (-5.5, -6.5, 4.4), (0.8, 0.0, 1.5), 980.0, (1.0, 0.68, 0.34), 3.6, 4.8)
        _add_area_light("Rim_Berlin", (5.8, 4.2, 4.2), (0.9, 0.5, 1.8), 860.0, (0.42, 0.64, 0.94), 3.2, 5.0)
        _add_area_light("Top_Soft", (0.5, -1.5, 7.0), (0.8, 0.2, 1.5), 620.0, (0.95, 0.88, 0.78), 3.0, 4.5)
        _add_camera((-2.2, -8.4, 2.35), (0.25, 0.4, 1.55), lens_mm=44.0, dof_target=(0.95, 0.5, 1.5))

    elif shot_id in ("spit-yaprak-beef", "spit-classic-kalb", "spit-chicken", "spit-vegan-seitan"):
        cfg_map = {
            "spit-yaprak-beef": ("yaprak", 101, (1.0, 0.60, 0.24), (0.45, 0.65, 0.90), False),
            "spit-classic-kalb": ("kalb", 202, (1.0, 0.72, 0.38), (0.52, 0.70, 0.92), False),
            "spit-chicken": ("chicken", 303, (1.0, 0.66, 0.22), (0.55, 0.72, 0.92), False),
            "spit-vegan-seitan": ("vegan", 404, (0.72, 0.95, 0.62), (0.35, 0.75, 0.55), True),
        }
        mkey, seed, key_col, rim_col, is_vegan = cfg_map[shot_id]
        # Plinth + full rotisserie unit pulled back cleanly (no clipping)
        _add_cylinder("Plinth", 0.92, 0.14, (0.0, 0.0, 0.07), mats["obsidian"], segs=64)
        _add_cylinder("PlinthBrassRing", 0.94, 0.025, (0.0, 0.0, 0.14), mats["brass"], segs=64)
        _add_rotisserie_hardware("SpitUnit", (0.0, 0.0, 1.16), mats, mats[mkey], seed=seed, include_housing=True, spit_height=1.42)

        if shot_id == "spit-classic-kalb":
            # Curved brass-handled carving knife resting on plinth front
            _add_box("KnifeBlade", (0.62, 0.055, 0.008), (-0.10, -0.58, 0.17), mats["steel"], bevel=0.002, rot=(0, 0, math.radians(-14)))
            _add_box("KnifeHandle", (0.20, 0.04, 0.03), (0.28, -0.68, 0.18), mats["brass"], bevel=0.006, rot=(0, 0, math.radians(-14)))
        if is_vegan:
            # Small emerald herb oil ceramic vessel on plinth front
            _add_cylinder("HerbVessel", 0.11, 0.07, (-0.42, -0.54, 0.18), mats["obsidian"], segs=32)
            _add_cylinder("HerbOilFill", 0.09, 0.015, (-0.42, -0.54, 0.21), mats["herb_oil"], segs=32)

        _add_area_light("Key_FrontL", (-3.4, -3.6, 2.8), (0.0, 0.0, 1.2), 640.0, key_col, 2.2, 3.2)
        _add_area_light("Rim_BackR", (3.2, 2.8, 2.6), (0.0, 0.0, 1.2), 520.0, rim_col, 1.8, 3.4)
        _add_area_light("Top_Hair", (0.0, -0.6, 4.4), (0.0, 0.0, 1.3), 380.0, (1.0, 0.92, 0.80), 1.4, 2.6)
        _add_camera((-0.45, -5.55, 1.56), (0.0, 0.05, 1.24), lens_mm=44.0, dof_target=(0.0, 0.0, 1.24))

    elif shot_id == "spit-signature-duo":
        _add_box("DuoPlinth", (2.35, 1.45, 0.14), (0.0, 0.0, 0.07), mats["obsidian"], bevel=0.02)
        _add_box("DuoBrassTrim", (2.38, 1.48, 0.025), (0.0, 0.0, 0.14), mats["brass"], bevel=0.005)
        _add_rotisserie_hardware("DuoL", (-0.64, 0.0, 1.15), mats, mats["yaprak"], seed=501, include_housing=True, spit_height=1.35)
        _add_rotisserie_hardware("DuoR", (0.64, 0.0, 1.15), mats, mats["chicken"], seed=502, include_housing=True, spit_height=1.35)
        _add_area_light("Key_L", (-4.0, -4.2, 3.0), (0.0, 0.0, 1.2), 780.0, (1.0, 0.65, 0.26), 2.8, 3.6)
        _add_area_light("Rim_R", (4.0, 3.2, 3.0), (0.0, 0.0, 1.2), 620.0, (0.48, 0.68, 0.94), 2.4, 3.6)
        _add_camera((0.0, -5.85, 1.65), (0.0, 0.05, 1.22), lens_mm=46.0, dof_target=(0.0, 0.0, 1.22))

    elif shot_id == "setup-station":
        _add_station_counter("SetupSt", (0.0, 0.0, 0.0), mats, width=2.55)
        _add_rotisserie_hardware("SetupSpit", (0.0, 0.18, 1.84), mats, mats["yaprak"], seed=601, include_housing=True, spit_height=1.32)
        _add_area_light("Key_L", (-4.2, -4.6, 3.6), (0.0, 0.0, 1.3), 760.0, (1.0, 0.68, 0.30), 2.8, 3.6)
        _add_area_light("Rim_R", (4.4, 3.2, 3.2), (0.0, 0.0, 1.3), 620.0, (0.48, 0.66, 0.92), 2.2, 3.6)
        _add_camera((-2.35, -5.65, 2.05), (0.0, 0.0, 1.38), lens_mm=45.0, dof_target=(0.0, 0.0, 1.38))

    elif shot_id == "setup-trailer":
        _add_club_trailer("SetupTr", (0.0, 0.2, 0.0), mats, rot_z_deg=-22.0)
        _add_area_light("Key_Front", (-5.0, -6.4, 4.4), (0.0, 0.0, 1.5), 960.0, (1.0, 0.72, 0.36), 3.6, 4.8)
        _add_area_light("Rim_Back", (5.4, 4.0, 4.2), (0.0, 0.2, 1.6), 820.0, (0.44, 0.66, 0.92), 3.2, 4.6)
        _add_camera((-2.6, -7.8, 2.25), (0.0, 0.2, 1.52), lens_mm=44.0, dof_target=(0.0, 0.2, 1.5))

    elif shot_id == "setup-buffet":
        # Long Executive Business Buffet Table
        _add_box("BuffetTable", (3.30, 1.15, 0.88), (0.0, 0.0, 0.44), mats["obsidian"], bevel=0.02)
        _add_box("BuffetBrassTrim", (3.34, 1.19, 0.04), (0.0, 0.0, 0.88), mats["brass"], bevel=0.006)
        # 3 Matte-Black Chafing Vessels with Brass Lids/Handles
        for bx in (-0.98, 0.0, 0.98):
            _add_box(f"ChafingBase_{bx}", (0.68, 0.48, 0.16), (bx, 0.10, 0.98), mats["obsidian"], bevel=0.015)
            _add_box(f"ChafingLid_{bx}", (0.66, 0.46, 0.10), (bx, 0.10, 1.10), mats["brass"], bevel=0.02)
            _add_cylinder(f"ChafingKnob_{bx}", 0.03, 0.05, (bx, 0.10, 1.17), mats["obsidian"], segs=24)
        # Foreground Stone-Baked Pide Platter & 3 Condiment Bowls
        _add_box("PidePlatter", (0.85, 0.44, 0.03), (-0.75, -0.34, 0.92), mats["bone"], bevel=0.01)
        for px in (-1.02, -0.84, -0.66, -0.48):
            _add_cylinder(f"Pide_{px}", 0.09, 0.035, (px, -0.34, 0.96), mats["pide"], segs=24)
        for cx, cmat in ((0.22, mats["sumac"]), (0.46, mats["herb_oil"]), (0.70, mats["crema"])):
            _add_cylinder(f"SauceBowl_{cx}", 0.09, 0.06, (cx, -0.34, 0.94), mats["obsidian"], segs=28)
            _add_cylinder(f"SauceFill_{cx}", 0.075, 0.015, (cx, -0.34, 0.965), cmat, segs=28)
        _add_area_light("Key_Warm", (-3.2, -3.8, 3.4), (0.0, 0.0, 1.0), 740.0, (1.0, 0.72, 0.36), 2.8, 3.6)
        _add_area_light("Rim_Cool", (3.6, 2.8, 3.0), (0.0, 0.0, 1.0), 520.0, (0.50, 0.68, 0.92), 2.4, 3.4)
        _add_camera((-1.65, -4.45, 2.15), (0.0, 0.0, 0.95), lens_mm=46.0, dof_target=(0.0, 0.0, 0.95))

    elif shot_id == "gallery-corporate":
        # Industrial Berlin Concrete Loft Summit
        for cx in (-3.4, -1.2, 1.2, 3.4):
            _add_box(f"LoftCol_{cx}", (0.52, 0.52, 5.2), (cx, 3.4, 2.6), mats["concrete"], bevel=0.02)
        _add_box("LoftBackWall", (16.0, 0.30, 5.5), (0.0, 4.4, 2.75), mats["concrete"], bevel=0.0)
        _add_station_counter("CorpSt", (0.65, 0.5, 0.0), mats, width=2.60)
        _add_rotisserie_hardware("CorpSpit", (0.65, 0.70, 1.84), mats, mats["yaprak"], seed=701, include_housing=True, spit_height=1.32)
        # Cocktail bistro tables in foreground left
        for tx, ty in ((-2.1, -1.2), (-1.4, 0.4)):
            _add_cylinder(f"BistroTop_{tx}", 0.42, 0.04, (tx, ty, 1.08), mats["obsidian"], segs=36)
            _add_cylinder(f"BistroCol_{tx}", 0.04, 1.06, (tx, ty, 0.53), mats["brass"], segs=24)
            _add_cylinder(f"BistroBase_{tx}", 0.28, 0.03, (tx, ty, 0.015), mats["obsidian"], segs=32)
        _add_area_light("Key_Warm", (-4.2, -5.2, 3.8), (0.2, 0.4, 1.4), 860.0, (1.0, 0.68, 0.30), 3.0, 4.0)
        _add_area_light("Loft_Cool", (4.8, 2.5, 4.4), (0.0, 1.5, 2.0), 680.0, (0.45, 0.65, 0.95), 3.2, 4.5)
        _add_camera((-2.6, -6.6, 2.15), (0.0, 0.6, 1.45), lens_mm=42.0, dof_target=(0.65, 0.5, 1.4))

    elif shot_id == "gallery-wedding":
        # Midnight Wedding & Gala Döner Bar — Champagne Brass + Warm Candle Pillars
        _add_station_counter("WedSt", (0.0, 0.4, 0.0), mats, width=2.65)
        _add_rotisserie_hardware("WedSpit", (0.0, 0.60, 1.84), mats, mats["yaprak"], seed=801, include_housing=True, spit_height=1.32)
        # Limestone serving platters + glass candle cylinders on counter & foreground pedestals
        _add_box("WedPlatterL", (0.58, 0.36, 0.03), (-0.75, 0.15, 0.99), mats["bone"], bevel=0.01)
        _add_box("WedPlatterR", (0.58, 0.36, 0.03), (0.75, 0.15, 0.99), mats["bone"], bevel=0.01)
        for cx, cy, ch in ((-1.9, -0.7, 0.95), (-1.6, -1.1, 0.75), (1.9, -0.7, 0.95), (1.6, -1.1, 0.75)):
            _add_cylinder(f"Pedestal_{cx}_{cy}", 0.22, ch, (cx, cy, ch * 0.5), mats["obsidian"], segs=32)
            _add_cylinder(f"CandleGlass_{cx}_{cy}", 0.08, 0.24, (cx, cy, ch + 0.12), mats["glass"], segs=24)
            _add_cylinder(f"CandleFlame_{cx}_{cy}", 0.025, 0.06, (cx, cy, ch + 0.08), mats["warm_glow"], segs=16)
        _add_area_light("Key_Candle", (-3.8, -4.6, 3.2), (0.0, 0.4, 1.3), 760.0, (1.0, 0.70, 0.36), 2.8, 3.6)
        _add_area_light("Rim_Champagne", (4.0, 3.2, 3.4), (0.0, 0.4, 1.4), 560.0, (1.0, 0.84, 0.62), 2.4, 3.6)
        _add_camera((1.85, -6.2, 2.05), (0.0, 0.4, 1.38), lens_mm=45.0, dof_target=(0.0, 0.4, 1.38))

    elif shot_id == "gallery-festival":
        # Open-Air Festival Courtyard with Club Trailer & Architectural Light Trusses
        _add_club_trailer("FestTr", (0.35, 0.8, 0.0), mats, rot_z_deg=18.0)
        # High-throughput foreground service bar counter
        _add_box("FestBar", (3.20, 0.65, 1.02), (-1.1, -2.1, 0.51), mats["obsidian"], bevel=0.02)
        _add_box("FestBarTop", (3.26, 0.70, 0.04), (-1.1, -2.1, 1.04), mats["brass"], bevel=0.006)
        # Architectural stage truss towers left & right
        for tx in (-3.8, 4.2):
            _add_box(f"Truss_{tx}", (0.28, 0.28, 4.6), (tx, 2.2, 2.3), mats["steel"], bevel=0.005)
            _add_box(f"StageLamp_{tx}", (0.34, 0.22, 0.22), (tx, 2.0, 4.3), mats["warm_glow"], bevel=0.01)
        _add_area_light("Stage_Amber", (-4.2, -4.5, 4.8), (0.2, 0.5, 1.5), 1100.0, (1.0, 0.58, 0.20), 3.4, 4.2)
        _add_area_light("Stage_Blue", (4.8, 3.8, 4.6), (0.0, 0.5, 1.6), 920.0, (0.36, 0.62, 0.98), 3.2, 4.4)
        _add_camera((2.65, -8.5, 2.35), (0.0, 0.4, 1.55), lens_mm=42.0, dof_target=(0.35, 0.8, 1.5))

    elif shot_id == "gallery-vip":
        # Intimate Chef's-Table VIP Tasting Spread on Obsidian Slate
        _add_box("VIPTable", (3.00, 1.80, 0.78), (0.0, 0.0, 0.39), mats["obsidian"], bevel=0.02)
        _add_box("VIPBrassInlay", (3.04, 1.84, 0.03), (0.0, 0.0, 0.78), mats["brass"], bevel=0.004)
        # Central Obsidian Carving Slab with Carved Meat Ribbons (small bmesh strips)
        _add_box("SlateSlab", (1.20, 0.72, 0.035), (0.0, 0.0, 0.815), mats["basalt"], bevel=0.006)
        rng = random.Random(909)
        for i in range(16):
            rx = rng.uniform(-0.34, 0.34)
            ry = rng.uniform(-0.18, 0.18)
            rz = 0.84 + (i % 3) * 0.014
            rot_z = rng.uniform(0.0, math.tau)
            _add_box(f"YaprakStrip_{i}", (0.16, 0.065, 0.014), (rx, ry, rz), mats["yaprak"], bevel=0.004, rot=(0.08, 0.05, rot_z))
        # Pide triangles + brass dipping vessels + carving knife
        for px, py in ((-0.78, -0.18), (-0.72, 0.16)):
            _add_cylinder(f"VIPPide_{px}_{py}", 0.14, 0.03, (px, py, 0.815), mats["pide"], segs=3)
        for bx, bmat in ((0.76, mats["sumac"]), (0.98, mats["herb_oil"]), (0.87, mats["crema"])):
            by = 0.16 if bmat != mats["crema"] else -0.16
            _add_cylinder(f"VIPBowl_{bx}", 0.085, 0.055, (bx, by, 0.825), mats["brass"], segs=28)
            _add_cylinder(f"VIPFill_{bx}", 0.072, 0.012, (bx, by, 0.848), bmat, segs=28)
        _add_box("VIPKnife", (0.54, 0.045, 0.008), (0.18, -0.50, 0.81), mats["steel"], bevel=0.002, rot=(0, 0, math.radians(12)))
        _add_box("VIPKnifeHandle", (0.16, 0.032, 0.025), (0.50, -0.43, 0.82), mats["brass"], bevel=0.005, rot=(0, 0, math.radians(12)))

        _add_area_light("Spot_Top", (-0.9, -1.3, 3.4), (0.0, 0.0, 0.82), 340.0, (1.0, 0.72, 0.36), 1.6, 2.0)
        _add_area_light("Rim_Cool", (2.6, 2.0, 2.2), (0.0, 0.0, 0.82), 260.0, (0.52, 0.68, 0.92), 1.8, 2.4)
        _add_camera((0.0, -2.55, 2.20), (0.0, 0.0, 0.82), lens_mm=46.0, dof_target=(0.0, 0.0, 0.82), fstop=3.2)


SHOTS = [
    ("hero-live-station", 1920, 1080),
    ("hero-club-trailer", 1920, 1080),
    ("spit-yaprak-beef", 1200, 900),
    ("spit-classic-kalb", 1200, 900),
    ("spit-chicken", 1200, 900),
    ("spit-signature-duo", 1200, 900),
    ("spit-vegan-seitan", 1200, 900),
    ("setup-station", 1200, 900),
    ("setup-trailer", 1200, 900),
    ("setup-buffet", 1200, 900),
    ("gallery-corporate", 1600, 1000),
    ("gallery-wedding", 1600, 1000),
    ("gallery-festival", 1600, 1000),
    ("gallery-vip", 1600, 1000),
]


def main() -> None:
    raw_out_dir = sys.argv[sys.argv.index("--") + 1]
    os.makedirs(raw_out_dir, exist_ok=True)

    bpy.ops.wm.read_factory_settings(use_empty=True)
    scene = bpy.context.scene
    _setup_render_engine(scene)

    for idx, (shot_id, width, height) in enumerate(SHOTS, start=1):
        _clear_scene()
        mats = _build_materials()
        scene.render.resolution_x = width
        scene.render.resolution_y = height
        _build_scene_shot(shot_id, mats, scene)
        out_path = os.path.join(raw_out_dir, f"{shot_id}.png")
        scene.render.filepath = out_path
        print(f"[BLENDER BATCH {idx:02d}/{len(SHOTS)}] Rendering {shot_id} ({width}x{height})...", flush=True)
        bpy.ops.render.render(write_still=True)


if __name__ == "__main__":
    main()
