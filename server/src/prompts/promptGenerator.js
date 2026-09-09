class PromptGenerator {
    constructor(project, characters) {
        this.project = project;
        this.characters = characters || [];
    }

    generateForScene(scene) {
        if (this.project.visualStyle === 'Cinematic') {
            return this.generateCinematic(scene);
        } else if (this.project.visualStyle === 'Vintage') {
            return this.generateVintage(scene);
        }
        
        throw new Error('Unknown visual style');
    }

    generateCinematic(scene) {
        // Find which characters are mentioned in this scene
        const mentionedCharacters = this.characters.filter(c => 
            scene.script.toLowerCase().includes(c.name.toLowerCase())
        );

        let characterSection = mentionedCharacters.length > 0 
            ? mentionedCharacters.map(c => `${c.name}: ${c.appearanceLock}`).join('\n')
            : 'No specific recurring characters in this scene.';

        return `SCENE:
${scene.script}

MAIN CHARACTER(S):
${characterSection}

COMPOSITION:
16:9 landscape frame.
Clear primary subject.
Natural cinematic composition.
Do not overcrowd the frame.

STYLE LOCK:
Professional cinematic digital story illustration, semi-realistic illustrated characters, clean linework, soft realistic shading, subtle cinematic lighting, natural colors, educational visual storytelling, emotionally expressive characters, consistent character design, high-quality illustrated storybook frame.

CONSTRAINTS:
No watermark. No logo. No random text. No subtitles. No distorted anatomy. No duplicate characters. No unnecessary background people. No visual clutter. 16:9 landscape.`;
    }

    generateVintage(scene) {
        return `Create a minimalist vintage educational story illustration.

SCENE:
${scene.script}

VISUAL STYLE:
1950s educational book illustration, black ink line drawing, retro editorial artwork, clean monochrome linework, classic English-learning textbook illustration, subtle vintage appearance.

BACKGROUND:
Warm aged cream paper, subtle natural grain, light vintage paper texture, minimal visual noise.

COMPOSITION:
16:9 landscape frame. Keep approximately 65-75% of the frame visually empty (blank paper) on the top and left side. Place the illustration EXCLUSIVELY in the bottom-right corner of the composition. Maintain strong negative space.

CONSTRAINTS:
NO TEXT. NO WORDS. NO LETTERS. NO CAPTIONS. NO LOGOS. NO WATERMARKS. No modern graphical elements. Minimal uncluttered composition.`;
    }
}

module.exports = PromptGenerator;
