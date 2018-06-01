/**
 * Copyright 2013 Joan Zapata
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * It uses FontAwesome font, licensed under OFL 1.1, which is compatible
 * with this library's license.
 *
 *     http://scripts.sil.org/cms/scripts/render_download.php?format=file&media_id=OFL_plaintext&filename=OFL.txt
 */
package com.younetco.ionicon;

import android.content.Context;
import android.graphics.Typeface;
import android.text.Spanned;
import android.widget.TextView;

import java.io.IOException;

import static android.text.Html.fromHtml;
import static android.text.Html.toHtml;
import static com.younetco.ionicon.Utils.replaceIcons;
import static com.younetco.ionicon.Utils.resourceToFile;
import static java.lang.String.valueOf;

public final class Iconify {

    private static final String TTF_FILE = "ionicons.ttf";

    public static final String TAG = Iconify.class.getSimpleName();

    private static Typeface typeface = null;

    private Iconify() {
        // Prevent instantiation
    }

    /**
     * Transform the given TextViews replacing {icon_xxx} texts with icons.
     */
    public static final void addIcons(TextView... textViews) {
        for (TextView textView : textViews) {
            textView.setTypeface(getTypeface(textView.getContext()));
            textView.setText(compute(textView.getText()));
        }
    }

    public static CharSequence compute(CharSequence charSequence) {
        if (charSequence instanceof Spanned) {
            String text = toHtml((Spanned) charSequence);
            return fromHtml(replaceIcons(new StringBuilder((text))).toString());
        }
        String text = charSequence.toString();
        return replaceIcons(new StringBuilder(text));
    }

    public static final void setIcon(TextView textView, IconValue value) {
        textView.setTypeface(getTypeface(textView.getContext()));
        textView.setText(valueOf(value.character));
    }

    /**
     * The typeface that contains FontAwesome icons.
     *
     * @return the typeface, or null if something goes wrong.
     */
    public static final Typeface getTypeface(Context context) {
        if (typeface == null) {
            typeface = Typeface.createFromAsset(context.getAssets(), TTF_FILE);
        }
        return typeface;
    }

    public static enum IconValue {

        ion_earth('\uf276'),
        ion_card('\uf119'),
        ion_cash('\uf316'),
        ion_ios_analytics_outline('\uf3cd'),
        ion_ios_bookmarks_outline('\uf3e9'),
        ion_ios_briefcase_outline('\uf3ed'),
        ion_ios_calendar_outline('\uf3f3'),
        ion_ios_circle_outline('\uf401'),
        ion_ios_copy_outline('\uf41b'),
        ion_ios_email_outline('\uf422'),
        ion_ios_film_outline('\uf42a'),
        ion_ios_gear_outline('\uf43c'),
        ion_ios_glasses_outline('\uf43e'),
        ion_ios_help_outline('\uf445'),
        ion_ios_musical_notes('\uf46c'),
        ion_ios_paper_outline('\uf471'),
        ion_ios_people_outline('\uf47b'),
        ion_ios_personadd_outline('\uf47f'),
        ion_ios_photos_outline('\uf481'),
        ion_ios_search('\uf4a5'),
        ion_ios_videocam('\uf4cd'),
        ion_power('\uf2a9'),
        ion_ribbon_b('\uf349'),
        ion_social_android_outline('\uf224'),
        ion_ios_pricetags_outline('\uf48e'),
        ion_social_rss_outline('\uf23c'),
        ion_person_stalker('\uf212'),
        ion_social_youtube_outline('\uf24c'),
        ion_ios_videocam_outline('\uf4cc')
        ;

        char character;

        IconValue(char character) {
            this.character = character;
        }

        public String formattedName() {
            return "{" + name() + "}";
        }

        public char character() {
            return character;
        }
    }
}
