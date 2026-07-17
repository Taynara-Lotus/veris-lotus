import { useState, useEffect } from 'react'
import { getEmpreendimentos, saveEmpreendimento, deleteEmpreendimento, getUsuarios, saveUsuario, loginUsuario } from '../supabase'

// ── Design tokens 4A ─────────────────────────────────────────────
const GOLD='#B99A54', BEIGE='#e4dfd0', OFF='#faf8f3'
const JET='#16140f', WHITE='#FFFFFF', MUTED='#736d5d', SUBTLE='#8a8477', WARM='#9a927e'
const LOGO_LOTUS = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAqwAAADSCAYAAACPdZKoAAAACXBIWXMAABYlAAAWJQFJUiTwAAAePElEQVR4nO3d7XXb1vK28Xs/K9/lfwViKrBSgZAKrFRgugIrFYSuIHIFpiuIXIGhCiJVEKqCI1UwzwdsxghFSqQIYGYD128trpM4PvaYJrFvzH5BklQpEDOrvWsAAABAHEmSeRfRZmbJuwYAAADE8f+8CwAAAACeQ2AFAABAaARWAAAAhEZgBQAAQGgEVgAAAIRGYAUAAEBoBFYAAACERmAFAABAaARWAAAAhEZgBQAAQGgEVgAAAIRGYAUAAEBoBFYAAACERmAFAABAaARWAAAAhEZgBQAAQGgEVgAAAIRGYAUAAEBoBFYAAACERmAFAABAaARWAAAAhPaTdwEAEEVK6UzSG+86JN2a2YN3EQAQRZJk3kW0mVnyrgHANKWUaknn3nVI+tXMau8iACAKlgQAAAAgNAIrAAAAQiOwAgAAIDQCKwAAAEIjsAIAACA0AisAAABCI7ACAAAgNAIrAAAAQiOwAgAAIDQCKwAAAEIjsAIAACA0AisAAABCI7ACAAAgNAIrAAAAQiOwAgAAIDQCKwAAAEIjsAIAACA0AisAAABCI7ACAAAgNAIrAAAAQiOwAgAAIDQCKwAAAEIjsAIAACA0AisAAABCI7ACAAAgNAIrAAAAQiOwAgAAIDQCKwAAAEIjsAIAACA0AisAAABCI7ACAAAgtJ+8CwBKklJ6I+lM0vp/1fr3tZmk0x2/xM3Gv6/yS5JqSTKz+tg6AQAxpZTWY8Ysv6Sn48j6x052/DJ3kh42fuy29WPrf741s82fV6QkybyLaDOz5F0DIEkppUrNBeNMzUXlfMDf/lHNBeffl5ndDvj7T1JKqdawf8+7/MqNC1C2PIbM9N9xZFczo293apoj7TFl5VTLqxBYAf3bOa1ar7eO5TznRk0ntibQdI/ACuA1ChpD2taNkVoFjCkEVkxWSmkm6ULSXGVcXDY9qrnQXEu6Hsu0jycCK4B95an9ucoJqC9pjyl1tA4sgRWTMoKQ+pxvGnl4zVNs373rGKleQ3KUm4EpjTGRvi9jed/zezpXM47sWl86FneSrhRkTOGUAExCSmmeB8x/JP2p8YVVSXon6YukVUppme/+AQBHSCnNUkqLlNJKzQ3Ae40/rErNOPlF0v/ymFJ5FkNgxWillN60LjJfFKC7M5ATNRfUv1NKtymluXM9AFCclFKVUlqqaXT8Ib8NUxG8l/Q9pbTyGlMIrBiddVBVsyNy6heZt5K+eF5kAKAkOajW+tFNxQ+nchpTCKwYjS1BdQpTNvtyu8gAQAk2gupUZuReqz2mXAzxGxJYMQoppUsRVPfRvshU3sUAgLe8RnUpguprnEr6K6VU503NvSGwomj5jvhWzUYqgur+TtWsR7ru+yIDAFHlZsetmPo/1rmkf/IsZy8IrChSnv6/UnNHPMYd/0N5J+k2X7QBYBJyV7UWzY6u/dFXt5XAiuLkqexbSR+dSxmLE0l/DjGlAwDe8prLWzH935dzNY2QqstflMCKouTphu+a9s7/vqwvMnPvQgCgD3lm7i/RVe3biZplZ/OufkECK4qQlwDUajZVoT8najZlLb0LAYCu5DHkWszMDa2z8YTAivDyE5tWYvpmSO/zQwfeeBcCAMfI17FazZp9DO99F6GVwIrQ8nRCLaZvPLxV85hXHvEKoEitsMrmXF9Hh1YCK8LKYfWLCKueTiTVQx0MDQBdIayGc1RoJbAipPyh/uJdByQ1ofUvNmMBKMy1CKvRvH/tWEJgRTg5rHKIczxfCK0ASpDHEfY9xPTlNUvNCKwIhbAaHqEVQGj5GsU4Elt96KZeAivCyGescpGJj9AKIKTcubvyrgMvOpG0POT/QGBFCDkAccZqOV41pQMAPVuKjbqleHfIhl4CK9zlDywbrMpTE1oBRJFn6dhkVZblvksDfuq7EuA5OfAsvevAq5xIuk4pnZnZg3cxAKYrpTSTdOlcRhceJd1u/NhK0mzLzx3DprITSQvt8XdHYIWbfFe1FNM3JTtVc3RM5VwHgGlbqLyx5E7NObG3km7NbDOo7iU3fmaSztRci0sLsh9TSldmtnruJxFY4Wmp8Uzf3El6UHPxWWv/8xs1F5P2P8/UBL7SnaeUFma28C4EwPTk7mopG3Zv1Ix99UsBbV856N6qaR5I+nep3fpVQpBfSJo/9xMIrHCRUrpU2c91vlETSGszq/f8/1xv/kDuMlf5daFyA+wfKaVD3gsA6MrCu4A9fJW06CqkvsTMrtUs2XqjZrr9UrGD6/vc+Fjt+glsusLg8vTFwruOV7iT9EHS/5lZZWaLYwOamT2Y2bWZXZrZTNLPkj5Luj+62uFdH3quHgAco4Du6o2kn81sPlRYbctjzELNjN6noX//A82f+48EVnhYKvad3qavkn41szMzW/a5wcjMVq3w+kFNSC7FwefqAcCR5t4F7PAo6UNubqy8i2kF118Ud1x5duNVkmQDFbIXM0veNaA/+diRUs5bvZF0+dqF8F3JZ9QuVM5ygd/ydFTncge3z6O0rhRjXfXverpTuG+3fd6MpZRqBdgMMqUxJqVUSfruXYfU3/ueUlop3rXxUVLlPXbs0trwHHFZ3s7xg8CKweSpm3+cy9jHo6R5X6HrtQoK+4+SZiUedRUlVKnp6NfeRXQpyns7pTFm7IE1Ly/7u+tf90ihw2pb0EehfzOzrQ8TYEkAhrT0LmAPN2rCVqiwKkkFTOesrc/VA4A+zb0L2KKIsJpdKt548m7XXggCKwaRj9hw76684FNebxS2M5gvhJWkb86lvOQjT8EC0LPKu4ANnwoKq8pj3YWarnAk1bYfJLBiKFfeBbzgQynniObF8xdqNoNFFv3vHEChchcuwnrztftSxpC2vCEs2hPCqm0/SGBF7/KmoWiL4ts+mNnSu4hDmdlczUkCUZ3nNXQA0LVoMzgL7wJeK49/N951tLCGFcPLd8GRO21FhtW1XPvv3nU8Y+ldAIBRqrwLaHkseRzJFt4FtJxuW8dKYEXfIj9do+iwumZmV4q7POA0d9gBoEuROqzhNukeKp9KEumBNU/+fgms6Nvcu4AdPo8hrK7l5QGRpnTaFt4FABidSE/VK2aj1QsizYZWmz9AYEVvAq9dvTGzaIvMu3ChWHfIa6esZQXQsUinzowlsEbqFNNhxaAW3gVs8ai4Xd+j5CNK5t517LDwLgAAehL2KMRD5BMDopzLyhpWDCN31CJ2Vy8jPNe5L3kd0ifvOrY4z086A4Cj7DpY3ktJZ6/uofYuIHvSQSewoi8Rp9xvxrRu9RlXirk0YOFdAIBRiLThSiN7SErtXcAuBFZ0LnfS3jmXsc3cu4AhBF4acBGtMwIAHRjTdS1Mt3hzVo7Aij5sPfTX2dcxLwXYlJcGRDs14EQxPxsAcIzRdFiDjZOz9r8QWNGHuXcBWyy8C3Cw8C5gi7l3AQDQscq7gI5F2Xj1HwRWdCqv5Yn0fGdpYt3VtaBdVjZfARibdyNb7hTy1AMCK7o29y5gi4V3AY4W3gVswbIAAK+Wb8ajmXsX0CECKyah8i5gwyS7q2v5wh5teofACmBsFiPqsobZeNVGYEVn8lRvtOUAS+8CAoj0uD2pWRYwlgs7AEjNptKFdxFdMLOFmaUAr7pdF4EVXYrWObsPOnU0tGs1T/iKJNpnBUBZoq3Pl6SP+ZHk6AGBFV2qvAvYEOm5yG7yuazR3ovKuwAARQu5zlLSl5E9SCAMAiu6FO1hAUvvAgIhsAIYk5DrLLOaTmv3CKzoREqp8q5hw/3Inu98FDOLtizglC4EgCPU3gU840RNp3XhXciYEFjRlcq7gA3ROooRRHtPCKwAXquEhsQfKaWas6e7QWBFV6KFj9q7gIBq7wI2VN4FAChTXpsf7ci+bc4l3dJtPR6BFV2pvAtoy1Pg+K/au4ANlXcBAIpWexewpxM13dYVa1tfj8CKo+XpjhPnMtoiHnfiLj9A4d67jpZTzmMFcISldwEHOlWztnWVUrrk+ncYAiu6MPMuYEPtXUBgtXcBG6ItJQFQiLyxNtJN+L5OJf0paZVSWrIBdT8EVnSh8i5gQwmL8b3U3gVs4EIN4BjRnuR3iBNJ7yX9nVK6zV3XmW9JcRFY0YVooYPAulu092bmXQCAoi0V68i+13qrpuv6D+F1OwIruhBpHc5jXquJLQKeTRvtZgdAQYI+ye9Y7fC6SildpZQm/zhrAiu6cO5dQEu0QBZRpKNgCKwAjnWpcXRZtzmV9FHSXykly+e6Xk5x3SuBFUcJuMtx5V1AAVbeBbREOl0CQIFyl7XktayHOFfTff07pfSQUrqeSoAlsOJY0b4kK+8CChCqCz2FCy2A3l2pzBMDjnEi6Z0mEmB/8i4A6FioMBbUg3cBG6J16QEUxswe8qH8371rcbQOsO8kKaUkNeeS15JqM6u9CusCHVYcq/IuYEO0MBZRtFA/uk4AgOHlQPbJu45gziX9Iel76Wtg6bBibFbeBeBgdFgBdMLMFimlSrE2A0dynl9KKT2qOWGhlnSd1wKHRYcVx5p5F9DGkVYvK31aCABecKFYp6FEtX5wwRdJ/2t1X2euVe1AYMWxZt4FoHjFTU0BiCt3CiuN96irvqxPIFg/vOAq0tIBAivGhDvqMrEkAECnCK1He6vm/Ncwj40lsGJMQq+/CebGuwAA6FN+st9MNDOO1X7yVp1PYxgcgRUAAIxSq9PKTXo3ziV9yWe+Xg3ZdSWw4ljsxAQAhGVmD2ZWSfrsXcuInKhZMvBPflhB1fdvSGAF4G3mXQCA8TOzS0m/iXWtXXun5pzXus/gSmAF4O3UuwAA02Bm12pukr85lzJG5+oxuBJYAQDAZOQlAheSfpV0713PCK2D67LLNa4EVgAAMDlmVpvZTM3jXFkm0L33km5TSpdd/GIEVgAAMFlmtlCzTIDg2r0TSX/mZQKzY34hAisAbwwQAFzlZQILEVz7cq6m2zp/7S9AYAXg7da7AACQfgRXM3sj6YN46ECXTtSc4bp8zf+ZwIpj8WUGAIyOmS3N7EzSL5K+iq5rV97nJQIHPZabwIpj8ThUAMBomdmtmc1z1/U3cSRWF84lHRRaCawYk4Pu1iaOJ5QBwIHM7DofifV/apYM0Hl9vbc6ILQSWDEmb70LAACMX17rutzovH4W57oeau/QSmDFsVgSgGPV3gUAI3XmXcBU5M7rZT7X9WdJv6tZOkD39WVvJV2/9JMIrDhWqB3ehy7inqKUEoMYJqvPZ50HxPXQgZmtzOzKzC5y9/UXNUdl3TiXFtl5SunquZ/w01CVAAM5Ex27lzCIAcBAzOxWreZOvmk6k1Tl14lHXQF9TCldm1m97T8SWHGslXcBONjMu4ANtXcBwEhxcxpQDmS1pCvp31mvKr/OJJ36VBbCMqV0ZmZPlhuyJADHWnkXsKHyLqAAM+8CAAyC5T8FyMdmrZcQzNSsgV2fQDC1TVynkhbb/gOBFceKtumKjsLLog1iodZBA4CnvAZ2fQLBTNMLsB9TSrPNHySw4ih5bU4k0cJYRDPvAtq2Tf0A6ATXwxF4IcCO9RSC5eYPEFjRhUh3fFygXxbpvFp2zQL9YTPPCG0E2PYpBGN6VPr5ZpeVwIourLwLaDnhaKvdAh5ptfIuABijgN919CSvgV2Y2Zl+nAE7hvC6aP8LgRVdqL0L2FB5FxBYtEFs5V0AMFLcuE9Q6wzYdXj9rHKXDbxvN6AIrOjCyruADdFCWSSVdwEbau8CMDmVdwEDqbwLgK8cXi/zsoEPirV8b18X638gsKILK+8CNlTeBQQWLcyvvAsARiradx2O8prXmcoLrgRWdGfXUykcnXsXEFGeWom04erRzFbeRWAw0U4UGbuZdwGIpxVcf1cZSwXerf+BwIquhFrgPbHnhe/r4uWfMqjauwAMKsrxZVPpPEa6OUUwZnal5rsQ/qSW9XhOYEVXau8CNkQLZxFU3gVsoOMGD6PfjMQNO/aR17hWas5zjaySCKzoTu1dwIbKu4CAooX42rsATNLMu4ABVN4FoBxmNleztjWqSiKwojvRumVvtz3abapSShcKdoh4wLXPmIZT7wIGUHkXgLKY2VLNwwcimkkEVnQkb56JtvMwWkfRU7T34pt3AcFV3gWM2ZgP1c+bK9l4ioOZ2UIxr82nkvSTdxUYlWtJH72LaLmUdOVdhLc8gEULrLV3ARhcLekP7yKymeLNCnWl8i6gD/kmI8r1/NbMLr2L6MlczXGDoWbkUkpnBFZ0qVaswHqaUjozs7EOTPsKtxxAzc0N4OVM4/0MRrs57Qqd4wGY2UNK6Upxbi7X3rAkAJ0xs4gDwFjvgg8R7T245/xVOKu8C+jRWAMrhnOlgGe0EljRtWjrX/7zLOKpycfbRDuPMeKNTTQz7wJ6sPIuoGWUa1hTSnPFm01BYczsQfGu0xWBFV2L9iGX4nUYh7TwLmCLpXcBBZh5F9C1YF31k5FuvBpzdzXS0q4pLE2ovQvYRGBF10IG1il2WXN3NdqF9Z41xXuZ3OfVQeVdQJfyMX7vXvhpxcpdPwyn9i5gE4EVncoXlWhPzTjRNLusC+8Ctoiyyze6aMs4uhLpEc6VdwEdW3gXMIAw6yrH/jSxYDMikgis6EfULuvMu4ihBO2uSjE/GyGNdMo6Upfs3VhmXvKf4713HQOINDszxu/npjA3CBKBFT3IpwVEe4jAiabRgVgPXkvvOrb4FvGuPbAxDoiRAoc0njWfU5m5WHkX0DLG7+emSN/XFYEVfVl6F7DF+7FP42SXivn4yaV3AXuI1AEc44AY6f2VRrBUKM8cTaG7KsUKrJV3AQOYeRfQQmBFb5beBeywHMs04DY5kEc78FlqNluVsBwgUkeh8i6gB5HeX0l6O4Kb2KV3AQOqvQtoOR3psp22UI0PAit6kad+o22+kpov4CinzwIvBZAmshyjY29HuO565V3AFnPvAl4rpXShmGvV+7LyLmDD3LuAvgS89twSWNGnqMHwfT5ge2yuFeyOOHsUm61eayxrLCVJQY80K3KpUA4US98qhpUbIZH2R8xHPGMXqntsZg8EVvQmD0433nXs8GVM0zkppaXidlquCjpDsfYuYEPxayy3iHS01drCu4BD5JB0rWk+1ar2LqBlzEcmRrpZvpNYEoD+LbwLeEY9htCaUrpU3E0Xj4rbaS/B6QhnAyJ2Wc/z96gUVxrvWb0vqb0L2DC6B9PkP0+kwHorEVjRMzOrFbfLeqLCQ2sOM3961/GMkrqrUswwtRjZgFh7F7DDooRrQZ5NiXqDOoTau4ANYzwy8VKxuve3kpQkmXMh/2FmybsGdCuvD/vuXcczHiVVQdfX7ZRSupL00buOZ9yb2cy7iEOllEJdE7PPZlZSB3CnHAr/9q5jhzs114KQN1klh9Uux/aU0q3idZh/zQ2aouWb45ViBdZfzOw2XGCFvz5uGgq40D5Kmpdw9FK+oFwp9vspSR/MbOldxKGCDoZSoe/nNimlB8UaENtChtYCrqHP6jiwXirezFKRjY9NKaVrSe+862h5NLM3EksCMJyFgj3mbcOJpL9SSgvvQp6Tu1O14g9cNwWHq5V3ATt8GdF61sg3hm/VLBUKsQwjpTTLN1HRv/NDivj5OVHh53zn60uksCq1/q4JrBhEPo6khM03f6SU6oBn0K27CrVidv82lTx9HblD8iWlVPSgmNXeBbzgraSV93FX+TsftePvJo8nEfdGrG92Zs51HCyH1S/edWxBYMXwzGyhmEfabDqX9E9KKcRml5RSlTssfyruNGrbp8KnxWrvAl7wXk2YCvH5fKWIHbJNJ5K+p5Suhn6f83e+VjnfeQ9L7wJ2eCvp1vtm5xD5xihiWH1sL9NjDSue6HPjWwEbsDY9qukWXg+9pi2/VwvFPV91mzszC7/T+jk5nPzPu44D3KgJ2bWkh+duFvKfbf33U0la//u5mhuNRY91btYSba3cc9bHs/V66kV+ctWlyvrO76WnvRGR10JL0mdJi2jroddaT0eM+j38ambz9g8YL17tl5mpz5eaC7/7n/PA10Oue9bze/NGzeP+bgP8mV/zOuv78zPES806Vu/3cujXYuD3eB7gz3zo60HNAH/R4ftQqbm2jPoz19NnaOH959rjtVKzodf9urbl+/cQ4P157vWf8YQOK56wAY4WC7wTex93aqY0a+vgGJO8karKr6h3uvsYtEPXp9J3ZL/S4H9/BXTIXrLubq/WL2vWVz6R1zW2X5VG2EndpY9xJegRTLvcqwnYg8/WteW1qgvFfIx3242ZVe0fILDiiYEC63q3ewkXmpfc6MeAdavmrvU5lX5MxZ5pJO/B5sWlZIE3IPTJI7AuJP0x5O8JH32NKwV+hh7VNDzWTY/ew2seb+f5Vcp48+RcWwIrnhgisEqTDQVj9KhmqUTIdVqvUeA61i54BNaSOmQ4Qo+B9Y2aRkH0juEuN2rqr9V06I/esJr3P7Rn7kr7fm1tgBBY8cRQgVWa7NTrmIzisOxtCtsU1AWXJR0FdsjwCn2OK3mz2l99/foO7vXjPOh9Z+2k8czY/bJtTCGw4okhA6sk5eNbJrOWa2RG8/SlTROcAfAKrHRZJ6DvcYVxZDR2Poaac1gRwYXKOJ8V//X7WMNqVsJZocXLS0kW3nWMXOSnDHZlrmn8OcdsvTFtKwIr3OUB60JcbEry1cxKeHLZq+XP5VfvOqYgf5YiPrloLEp+8txe8ukMc+cycJz5c3shCKwIIV9sKhFaS/DkMOcRW3oXMCFz8f3vw+eRz4T8y5qnIn32rgOv8umlYyIJrAgjL7KuxKAV2ZTCqvIFlM7fAOiQ9eLbrvWAY5X/vHxny3Kzz/p5AitCIbSGNqmw2rLwLmAq6JB16k7TvQFgX0Q57tT8fb2IwIpwCK0hfZ5oWKXLOrDcIWPt8HHu1Bw3N5qzkQ+R/9yVGEOiWx+LuNfnlMCKkHJonYm75Ag+TG1acYu5dwETcym++6816bC6RmgN76CwKhFYEVjrgvPNuZSpelTzeLyldyHe8vrKT951TEXru09oPQxhtSU3Ps7E5yia9ef0oAfOEFgRmpk9mNmFCAtDu5N09tKuzSnJmwIY+AZCaD3YNxFWn2idQMPnKIZXhVWJwIpC5LDwm5jeGcJnNReUlXchAXFe8IAIrXv7bGYXhNXtWp8j1kb7+qojbqoIrChG3kF8JjbA9OVR0m9mdsnAt12rW4OBtMIG3/unHsUa873k2bq5pN+9a5mo383s2QcDvITAiqKY2crMKjUXHTpd3fkmaZZvCvCMPJX1wbuOKclhoxIdsrb11OrSu5CS5Keq/SK69kO5l/RLF09GJLCiSPnDT7f1ePdquqpMJx4ghwRC68Byh+yDuFn9ZGZnr1kHiOam08zOxN6Ivn1Wsxeik88pgRXFanVbf1MTvLC/RzUX6zO6qq+TQ+svIjwNKr/vlabZIbtR061aeBcyBvl9/Fk0Prq2/px2uryMwIrimdm1mc3UBDDCw8u+qgmqC7qqx+HYHB8bHbIpfOfv1axVfdXuauzWanz8Khofx+r1c0pgxWjku+WZpjOIHeqrpJ/zwveVdzFjkQc8phcd5O/8mcZ7VnN7JmTpXMuomVmdGx8fRHA91Dqozvr8nBJYMSp5c8ZCTXD9XVx4HtWsIyKo9ozpRR/5huFCTYdsLO/9vZrr14yZkGGZ2TIH1zF9nvpypwGC6lqSZH3/JiiLmSXvGrqUUrpQ82jNd86lDOlO0pWkawa74aWUKkkLSee+lRzk0xjWRub3/lJlft9vJC37GPxTSq5jfanjSkpppubzdCHp1LWYGB4lXUu6Gnp5CoEVT5R6YXlJvvBcqLn4jPHC8yhpqWbAY51bAK3Bbi7pxLOWPYwisK7l936eX5G/73dqvrfXfc6AEFiPl5sf61f073PXvqkJqm5NkCQOwcaGKTyOM6V0ph8XnrfO5RzjXj8uIrVzLXhGHuwqxerU3Euq16+xLhnJ3/e54rz3N/rxvV0N8RvmzrObsV2f8vu5/k6XPIbssu6k1goyU5fMaLBi2nInpmq9IgxouzzqR8AYbLBDt/Jn7iy/qvy/fXZsHiXdSlrlVy3pNsIgNLSN7/uZ+g8b92re+1s1NwV1z78fBpZSeqP/fqZKWgq0tv6c1mo+p+Fm6QiswAaHMLHLOmS0B7uVQx0YSKsLdibpTes/bf5724Oaz0fbbf7xh4gDTzT5fX+jH+/zWf5Pb/RyoL1XcxMg/bghWElaEU6nK3f1z9RsAK7y/0Zphtyp+Yz+O76UMLYQWIE9PTOozfS6C1F7oFsHjFV+TbL7BQBjloNsexxpjyXS8Q2S9skGm+PKqoRgusv/B1Cx9Mu/WU2IAAAAAElFTkSuQmCC'

const ROLE_LABEL = { adm_global:'Adm Global', adm_empreendimento:'Adm Empreendimento', visualizador:'Visualizador' }

// Carregar Playfair Display
if (!document.getElementById('vf')) {
  const l=document.createElement('link');l.id='vf';l.rel='stylesheet'
  l.href='https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600&family=Inter:wght@400;500;600&display=swap'
  document.head.appendChild(l)
}

const PF = "'Playfair Display',Georgia,serif"
const IN = "Inter,-apple-system,sans-serif"

function Field({ label, value, onChange, type='text', placeholder }) {
  return (
    <div style={{marginBottom:20}}>
      {label && <div style={{fontSize:9,letterSpacing:'.15em',textTransform:'uppercase',color:SUBTLE,marginBottom:6,fontFamily:IN}}>{label}</div>}
      <input type={type} value={value||''} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
        style={{width:'100%',boxSizing:'border-box',background:'transparent',border:'none',
          borderBottom:'1px solid #3a352c',color:'#f2ede3',padding:'8px 0',fontSize:13,
          fontWeight:300,outline:'none',fontFamily:IN}}
        onFocus={e=>e.target.style.borderBottomColor=GOLD}
        onBlur={e=>e.target.style.borderBottomColor='#3a352c'}/>
    </div>
  )
}

function FieldLight({ label, value, onChange, type='text', placeholder }) {
  return (
    <div style={{marginBottom:16}}>
      {label && <div style={{fontSize:9,letterSpacing:'.15em',textTransform:'uppercase',color:SUBTLE,marginBottom:5,fontFamily:IN}}>{label}</div>}
      <input type={type} value={value||''} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
        style={{width:'100%',boxSizing:'border-box',background:'transparent',border:'none',
          borderBottom:`1px solid ${BEIGE}`,color:JET,padding:'8px 0',fontSize:13,
          fontWeight:400,outline:'none',fontFamily:IN}}
        onFocus={e=>e.target.style.borderBottomColor=GOLD}
        onBlur={e=>e.target.style.borderBottomColor=BEIGE}/>
    </div>
  )
}

function Panel({ open, onClose, title, children, wide }) {
  return (
    <>
      {open && <div onClick={onClose} style={{position:'fixed',inset:0,background:'rgba(22,20,15,.55)',zIndex:200}}/>}
      <div style={{position:'fixed',top:0,right:0,bottom:0,width:wide?400:310,background:OFF,zIndex:201,
        transform:open?'translateX(0)':'translateX(100%)',transition:'transform .3s ease',
        borderLeft:`1px solid ${BEIGE}`,overflowY:'auto',boxShadow:'-20px 0 60px -20px rgba(0,0,0,.2)'}}>
        <div style={{padding:'18px 22px',borderBottom:`1px solid ${BEIGE}`,display:'flex',alignItems:'center',
          justifyContent:'space-between',position:'sticky',top:0,background:OFF,zIndex:5}}>
          <div style={{fontFamily:PF,fontSize:17,fontWeight:500,color:JET}}>{title}</div>
          <button onClick={onClose} style={{background:'none',border:'none',fontSize:18,cursor:'pointer',color:JET,opacity:.4}}>✕</button>
        </div>
        <div style={{padding:22}}>{children}</div>
      </div>
    </>
  )
}

function EmpModal({ emp, onClose, onSave, onDelete, onArchive }) {
  const [form, setForm] = useState(emp || {nome:'',cidade:'',estado:'',pais:'Brasil',cert:'',nivel:'',foto:''})
  const [tab, setTab] = useState('dados')
  const isEdit = !!emp?.id
  const handleFoto = e => {
    const f=e.target.files[0];if(!f)return
    const r=new FileReader();r.onload=ev=>setForm(p=>({...p,foto:ev.target.result}));r.readAsDataURL(f)
  }
  return (
    <div style={{position:'fixed',inset:0,background:'rgba(22,20,15,.72)',zIndex:300,display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
      <div style={{background:OFF,width:'100%',maxWidth:390,maxHeight:'90vh',overflowY:'auto',borderRadius:6,boxShadow:'0 40px 80px -20px rgba(0,0,0,.55)'}} onClick={e=>e.stopPropagation()}>
        <div style={{padding:'18px 22px',borderBottom:`1px solid ${BEIGE}`,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <div style={{fontFamily:PF,fontSize:17,color:JET,fontWeight:500}}>{isEdit?'Editar':'Novo Empreendimento'}</div>
          <button onClick={onClose} style={{background:'none',border:'none',fontSize:18,cursor:'pointer',color:JET,opacity:.4}}>✕</button>
        </div>
        {isEdit && (
          <div style={{display:'flex',borderBottom:`1px solid ${BEIGE}`,padding:'0 22px'}}>
            {['dados','capa'].map(t=>(
              <button key={t} onClick={()=>setTab(t)} style={{padding:'10px 14px',border:'none',background:'transparent',
                color:tab===t?GOLD:SUBTLE,fontSize:9,letterSpacing:'.15em',textTransform:'uppercase',cursor:'pointer',
                borderBottom:tab===t?`2px solid ${GOLD}`:'2px solid transparent',fontFamily:IN}}>
                {t==='dados'?'Dados':'Capa'}
              </button>
            ))}
          </div>
        )}
        <div style={{padding:22}}>
          {tab==='dados' && [['Nome','nome'],['Cidade','cidade'],['Estado','estado'],['País','pais'],['Certificação','cert'],['Nível','nivel']].map(([l,k])=>(
            <FieldLight key={k} label={l} value={form[k]} onChange={v=>setForm({...form,[k]:v})}/>
          ))}
          {tab==='capa' && (
            form.foto
              ? <div style={{position:'relative',marginBottom:14}}>
                  <img src={form.foto} style={{width:'100%',aspectRatio:'3/2',objectFit:'cover',borderRadius:4}}/>
                  <button onClick={()=>setForm(p=>({...p,foto:''}))} style={{position:'absolute',top:8,right:8,background:'rgba(22,20,15,.7)',border:'none',color:WHITE,borderRadius:3,padding:'3px 8px',fontSize:10,cursor:'pointer'}}>✕</button>
                </div>
              : <label style={{display:'flex',alignItems:'center',justifyContent:'center',width:'100%',aspectRatio:'3/2',border:`1.5px dashed ${BEIGE}`,borderRadius:4,cursor:'pointer',color:SUBTLE,fontSize:12,flexDirection:'column',gap:8,marginBottom:14}}>
                  <span style={{fontSize:22}}>📷</span>
                  Adicionar foto de capa
                  <input type="file" accept="image/*" style={{display:'none'}} onChange={handleFoto}/>
                </label>
          )}
          <div style={{display:'flex',gap:8,marginTop:8}}>
            <button onClick={onClose} style={{flex:1,background:'transparent',border:`1px solid ${BEIGE}`,padding:'11px',fontSize:9,letterSpacing:'.15em',textTransform:'uppercase',cursor:'pointer',color:JET,fontFamily:IN}}>Cancelar</button>
            <button onClick={()=>onSave(form)} style={{flex:1,background:JET,color:WHITE,border:'none',padding:'11px',fontSize:9,letterSpacing:'.15em',textTransform:'uppercase',cursor:'pointer',fontFamily:IN}}>Salvar</button>
          </div>
          {isEdit && (
            <div style={{marginTop:14,display:'flex',gap:8}}>
              <button onClick={()=>onArchive(emp)} style={{flex:1,background:'transparent',border:'1px solid #E65100',color:'#E65100',padding:'9px',fontSize:9,letterSpacing:'.12em',textTransform:'uppercase',cursor:'pointer',fontFamily:IN}}>📦 Arquivar</button>
              <button onClick={()=>onDelete(emp.id)} style={{flex:1,background:'transparent',border:'1px solid #C0392B',color:'#C0392B',padding:'9px',fontSize:9,letterSpacing:'.12em',textTransform:'uppercase',cursor:'pointer',fontFamily:IN}}>🗑 Excluir</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function UserModal({ user, onClose, onSave, isAdmGlobal }) {
  const [form, setForm] = useState(user || {nome:'',email:'',senha:'',telefone:'',role:'visualizador',projeto:''})
  const [changePass, setChangePass] = useState(false)
  return (
    <div style={{position:'fixed',inset:0,background:'rgba(22,20,15,.72)',zIndex:400,display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
      <div style={{background:OFF,width:'100%',maxWidth:370,borderRadius:6,maxHeight:'90vh',overflowY:'auto',boxShadow:'0 40px 80px -20px rgba(0,0,0,.55)'}} onClick={e=>e.stopPropagation()}>
        <div style={{padding:'18px 22px',borderBottom:`1px solid ${BEIGE}`,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <div style={{fontFamily:PF,fontSize:17,color:JET,fontWeight:500}}>{user?.id?'Editar Usuário':'Novo Usuário'}</div>
          <button onClick={onClose} style={{background:'none',border:'none',fontSize:18,cursor:'pointer',color:JET,opacity:.4}}>✕</button>
        </div>
        <div style={{padding:22}}>
          <FieldLight label="Nome completo" value={form.nome} onChange={v=>setForm({...form,nome:v,initials:v.split(' ').slice(0,2).map(w=>w[0]?.toUpperCase()||'').join('')})}/>
          <FieldLight label="E-mail (login)" value={form.email} onChange={v=>setForm({...form,email:v})} type="email"/>
          <FieldLight label="Telefone" value={form.telefone} onChange={v=>setForm({...form,telefone:v})}/>
          <div style={{marginBottom:14}}>
            <div style={{fontSize:9,letterSpacing:'.15em',textTransform:'uppercase',color:SUBTLE,marginBottom:5,fontFamily:IN}}>Perfil</div>
            <select value={form.role} onChange={e=>setForm({...form,role:e.target.value})} disabled={!isAdmGlobal}
              style={{width:'100%',border:'none',borderBottom:`1px solid ${BEIGE}`,padding:'8px 0',fontSize:13,background:'transparent',outline:'none',color:JET,fontFamily:IN}}>
              <option value="adm_global">Adm Global</option>
              <option value="adm_empreendimento">Adm Empreendimento</option>
              <option value="visualizador">Visualizador</option>
            </select>
          </div>
          {form.role==='adm_empreendimento' && <FieldLight label="Projeto vinculado" value={form.projeto} onChange={v=>setForm({...form,projeto:v})}/>}
          {!user?.id
            ? <FieldLight label="Senha" value={form.senha} onChange={v=>setForm({...form,senha:v})} type="password"/>
            : <>
                <button onClick={()=>setChangePass(!changePass)} style={{fontSize:9,color:GOLD,background:'none',border:'none',cursor:'pointer',padding:'4px 0',marginBottom:8,letterSpacing:'.1em',textTransform:'uppercase',fontFamily:IN}}>
                  {changePass?'▲ Cancelar':'▼ Alterar senha'}
                </button>
                {changePass && <FieldLight label="Nova senha" value={form.senha} onChange={v=>setForm({...form,senha:v})} type="password"/>}
              </>
          }
          <div style={{display:'flex',gap:8,marginTop:14}}>
            <button onClick={onClose} style={{flex:1,background:'transparent',border:`1px solid ${BEIGE}`,padding:'11px',fontSize:9,letterSpacing:'.15em',textTransform:'uppercase',cursor:'pointer',color:JET,fontFamily:IN}}>Cancelar</button>
            <button onClick={()=>onSave({...form})} style={{flex:1,background:JET,color:WHITE,border:'none',padding:'11px',fontSize:9,letterSpacing:'.15em',textTransform:'uppercase',cursor:'pointer',fontFamily:IN}}>Salvar</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function TelaInicial({ onLogin, onSelectObra, authed, currentUser, onLogout, onUserUpdate }) {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [loginErr, setLoginErr] = useState('')
  const [forgotMode, setForgotMode] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotMsg, setForgotMsg] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const [panel, setPanel] = useState(null)
  const [empModal, setEmpModal] = useState(null)
  const [userModal, setUserModal] = useState(null)
  const [emps, setEmps] = useState([])
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [profileForm, setProfileForm] = useState({})
  const [editingProfile, setEditingProfile] = useState(false)
  const [imgErrors, setImgErrors] = useState({})
  const [showArchived, setShowArchived] = useState(false)

  useEffect(() => {
    if (!authed) return
    ;(async () => {
      const [empsData, usersData] = await Promise.all([
        emps.length > 0 ? Promise.resolve(emps) : getEmpreendimentos(),
        getUsuarios()
      ])
      setEmps(empsData); setUsuarios(usersData)
      setProfileForm(currentUser || {}); setLoading(false)
    })()
  }, [authed])

  const handleLogin = async () => {
    if (!email || !senha) { setLoginErr('Preencha e-mail e senha.'); return }
    const [u, empsData] = await Promise.all([loginUsuario(email.trim().toLowerCase(), senha), getEmpreendimentos()])
    if (u) { setLoginErr(''); setEmps(empsData); setLoading(false); onLogin(u); setProfileForm(u) }
    else setLoginErr('E-mail ou senha incorretos.')
  }

  const handleForgot = () => {
    const found = usuarios.find(u => u.email === forgotEmail)
    setForgotMsg(found ? `Senha atual: ${found.senha}` : 'E-mail não encontrado.')
  }

  const handleSaveEmp = async form => {
    const saved = await saveEmpreendimento(form)
    if (saved) setEmps(prev => { const i=prev.findIndex(e=>e.id===saved.id); return i>=0?prev.map(e=>e.id===saved.id?saved:e):[...prev,saved] })
    setEmpModal(null)
  }
  const handleDeleteEmp = async id => {
    if (!window.confirm('Excluir este empreendimento?')) return
    await deleteEmpreendimento(id); setEmps(prev=>prev.filter(e=>e.id!==id)); setEmpModal(null)
  }
  const handleArchiveEmp = async emp => {
    const u = await saveEmpreendimento({...emp,arquivado:true})
    if (u) setEmps(prev=>prev.map(e=>e.id===u.id?u:e)); setEmpModal(null)
  }
  const handleSaveUser = async form => {
    const saved = await saveUsuario(form)
    if (saved) {
      setUsuarios(prev => { const i=prev.findIndex(u=>u.id===saved.id); return i>=0?prev.map(u=>u.id===saved.id?saved:u):[...prev,saved] })
      if (saved.id===currentUser?.id && onUserUpdate) onUserUpdate(saved)
    }
    setUserModal(null)
  }
  const handleSaveProfile = async () => {
    const p={...profileForm}; if(p._newSenha){p.senha=p._newSenha;delete p._newSenha}
    const saved=await saveUsuario(p); if(saved&&onUserUpdate)onUserUpdate(saved)
    setEditingProfile(false); setPanel(null)
  }

  const podeEditar = currentUser?.role !== 'visualizador'
  const isAdmGlobal = currentUser?.role === 'adm_global'
  const empsVisiveis = emps.filter(e => {
    if (showArchived) return e.arquivado
    if (e.arquivado) return false
    if (isAdmGlobal || currentUser?.role==='visualizador') return true
    return e.nome === currentUser?.projeto
  })

  // ── SPLASH + LOGIN ────────────────────────────────────────────
  if (!authed) {
    return (
      <div style={{height:'100vh',background:'radial-gradient(ellipse at 50% 22%, #1c1912 0%, #0b0a07 75%)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',fontFamily:IN,position:'relative'}}>
        {!forgotMode ? <>
          {/* Logo VĒRIS — abertura cinematográfica */}
          <div style={{fontFamily:PF,fontSize:32,letterSpacing:'.18em',color:'#f2ede3',marginBottom:64,textShadow:'0 0 40px rgba(201,162,39,0.2)'}}>
            V<span style={{color:GOLD}}>Ē</span>RIS
          </div>

          {/* Form credenciais */}
          <div style={{width:250,display:'flex',flexDirection:'column',gap:0}}>
            <Field label="E-mail" value={email} onChange={setEmail} type="email"/>
            <Field label="Senha" value={senha} onChange={setSenha} type="password"/>
            {loginErr && <div style={{fontSize:11,color:'#e74c3c',marginBottom:8,marginTop:-8}}>{loginErr}</div>}
            <button onClick={handleLogin} onKeyDown={e=>e.key==='Enter'&&handleLogin()}
              style={{marginTop:24,height:42,border:`1px solid ${GOLD}`,background:'transparent',color:GOLD,
                fontSize:10,letterSpacing:'.2em',textTransform:'uppercase',cursor:'pointer',fontFamily:IN,
                fontWeight:600,borderRadius:2,transition:'all .2s'}}
              onMouseEnter={e=>{e.target.style.background=GOLD;e.target.style.color=JET}}
              onMouseLeave={e=>{e.target.style.background='transparent';e.target.style.color=GOLD}}>
              ENTRAR
            </button>
            <button onClick={()=>setForgotMode(true)} style={{marginTop:14,background:'none',border:'none',color:WARM,fontSize:9,letterSpacing:'.08em',cursor:'pointer',fontFamily:IN}}>
              Esqueci minha senha
            </button>
          </div>

          {/* Logo Lotus rodapé */}
          <div style={{position:'absolute',bottom:28,display:'flex',flexDirection:'column',alignItems:'center',gap:6}}>
            <img src={LOGO_LOTUS} style={{height:13,objectFit:'contain',filter:'brightness(0) invert(1)',opacity:.5}} alt="Lotus"/>
          </div>
        </> : <>
          <div style={{fontFamily:PF,fontSize:24,letterSpacing:'.18em',color:'#f2ede3',marginBottom:48}}>V<span style={{color:GOLD}}>Ē</span>RIS</div>
          <div style={{width:250}}>
            <div style={{fontSize:10,color:WARM,marginBottom:18,textAlign:'center',lineHeight:1.6}}>Digite seu e-mail cadastrado</div>
            <Field label="E-mail" value={forgotEmail} onChange={setForgotEmail} type="email"/>
            {forgotMsg && <div style={{fontSize:11,color:GOLD,marginBottom:12,background:'rgba(185,154,84,.1)',padding:'10px 12px',borderRadius:3,lineHeight:1.5}}>{forgotMsg}</div>}
            <button onClick={handleForgot} style={{width:'100%',height:42,border:`1px solid ${GOLD}`,background:'transparent',color:GOLD,fontSize:10,letterSpacing:'.2em',textTransform:'uppercase',cursor:'pointer',fontFamily:IN,fontWeight:600,marginBottom:12,borderRadius:2}}>ENVIAR</button>
            <button onClick={()=>{setForgotMode(false);setForgotMsg('');}} style={{width:'100%',background:'none',border:'none',color:WARM,fontSize:9,cursor:'pointer',fontFamily:IN}}>← Voltar</button>
          </div>
        </>}
      </div>
    )
  }

  // ── MENU PRINCIPAL (tela 3 do 4A) ────────────────────────────
  return (
    <div style={{fontFamily:IN,background:'#F7F5F0',minHeight:'100vh',color:JET}}>

      {/* HEADER — fundo preto, logo centrada, settings SVG + avatar */}
      <header style={{position:'sticky',top:0,zIndex:100,background:JET,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 22px',height:54}}>
        <button onClick={()=>setMenuOpen(true)} style={{background:'none',border:'none',cursor:'pointer',padding:6,display:'flex',flexDirection:'column',gap:4.5,opacity:.8}}>
          <span style={{display:'block',width:19,height:1.5,background:'#f2ede3',borderRadius:1}}/>
          <span style={{display:'block',width:13,height:1.5,background:'#f2ede3',borderRadius:1}}/>
          <span style={{display:'block',width:19,height:1.5,background:'#f2ede3',borderRadius:1}}/>
        </button>

        <div style={{position:'absolute',left:'50%',transform:'translateX(-50%)',fontFamily:PF,fontSize:15,letterSpacing:'.22em',color:'#f2ede3'}}>
          V<span style={{color:GOLD}}>Ē</span>RIS
        </div>

        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <button onClick={()=>setPanel('settings')} style={{background:'none',border:'none',cursor:'pointer',opacity:.55,padding:3,lineHeight:1}}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#f2ede3" strokeWidth="1.4">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.7 1.7 0 00.3 1.9l.1.1a2 2 0 11-2.9 2.9l-.1-.1a1.7 1.7 0 00-1.9-.3 1.7 1.7 0 00-1 1.6V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1-1.6 1.7 1.7 0 00-1.9.3l-.1.1a2 2 0 11-2.9-2.9l.1-.1a1.7 1.7 0 00.3-1.9 1.7 1.7 0 00-1.6-1H3a2 2 0 110-4h.1a1.7 1.7 0 001.6-1 1.7 1.7 0 00-.3-1.9l-.1-.1a2 2 0 112.9-2.9l.1.1a1.7 1.7 0 001.9.3H9a1.7 1.7 0 001-1.6V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.6 1.7 1.7 0 001.9-.3l.1-.1a2 2 0 112.9 2.9l-.1.1a1.7 1.7 0 00-.3 1.9V9a1.7 1.7 0 001.6 1H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.6 1z"/>
            </svg>
          </button>
          <div onClick={()=>{setEditingProfile(false);setPanel('perfil')}}
            style={{width:26,height:26,borderRadius:'50%',background:GOLD,color:JET,fontSize:9,fontWeight:700,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer'}}>
            {currentUser?.initials||'?'}
          </div>
        </div>
      </header>

      {/* MENU FOCUS — overlay escuro */}
      {menuOpen && (
        <div style={{position:'fixed',inset:0,background:'rgba(22,20,15,.84)',backdropFilter:'blur(4px)',zIndex:150,display:'flex',flexDirection:'column',padding:'70px 36px 36px',gap:36}}>
          <button onClick={()=>setMenuOpen(false)} style={{position:'absolute',top:16,right:22,background:'none',border:'none',color:'#f2ede3',fontSize:22,cursor:'pointer',opacity:.55}}>✕</button>
          <div>
            <div style={{fontSize:8,letterSpacing:'.28em',color:WARM,textTransform:'uppercase',marginBottom:16,paddingBottom:8,borderBottom:'1px solid rgba(255,255,255,.06)'}}>Menu Principal</div>
            {['Início','Relatórios','Documentos'].map(t=>(
              <button key={t} onClick={()=>setMenuOpen(false)}
                style={{display:'block',width:'100%',textAlign:'left',background:'none',border:'none',fontFamily:PF,fontSize:21,fontWeight:500,color:'#f2ede3',letterSpacing:.02,padding:'6px 0',cursor:'pointer',transition:'padding-left .15s'}}
                onMouseEnter={e=>e.target.style.paddingLeft='10px'} onMouseLeave={e=>e.target.style.paddingLeft='0'}>{t}</button>
            ))}
            <button onClick={()=>{setMenuOpen(false);setPanel('usuarios')}} style={{display:'block',width:'100%',textAlign:'left',background:'none',border:'none',fontFamily:PF,fontSize:21,fontWeight:500,color:'#f2ede3',letterSpacing:.02,padding:'6px 0',cursor:'pointer',transition:'padding-left .15s'}}
              onMouseEnter={e=>e.target.style.paddingLeft='10px'} onMouseLeave={e=>e.target.style.paddingLeft='0'}>Gestão de Usuários</button>
            <button onClick={()=>{setMenuOpen(false);setEditingProfile(false);setPanel('perfil')}} style={{display:'block',width:'100%',textAlign:'left',background:'none',border:'none',fontFamily:PF,fontSize:21,fontWeight:500,color:'#f2ede3',letterSpacing:.02,padding:'6px 0',cursor:'pointer',transition:'padding-left .15s'}}
              onMouseEnter={e=>e.target.style.paddingLeft='10px'} onMouseLeave={e=>e.target.style.paddingLeft='0'}>Meu Perfil</button>
            <button onClick={()=>{setMenuOpen(false);setShowArchived(true)}} style={{display:'block',width:'100%',textAlign:'left',background:'none',border:'none',fontFamily:PF,fontSize:21,fontWeight:500,color:'rgba(185,154,84,.4)',letterSpacing:.02,padding:'6px 0',cursor:'pointer'}}>Empreendimentos Arquivados</button>
          </div>
          <div>
            <div style={{fontSize:8,letterSpacing:'.28em',color:WARM,textTransform:'uppercase',marginBottom:16,paddingBottom:8,borderBottom:'1px solid rgba(255,255,255,.06)'}}>Empreendimentos</div>
            {emps.filter(e=>!e.arquivado).map(e=>(
              <button key={e.id} onClick={()=>{setMenuOpen(false);onSelectObra(e)}}
                style={{display:'block',width:'100%',textAlign:'left',background:'none',border:'none',fontSize:11,color:'rgba(242,237,227,.55)',letterSpacing:.06,padding:'4px 0 4px 12px',cursor:'pointer',fontFamily:IN,transition:'color .15s'}}
                onMouseEnter={ev=>ev.target.style.color='#f2ede3'} onMouseLeave={ev=>ev.target.style.color='rgba(242,237,227,.55)'}>
                {e.nome} — {e.cidade}
              </button>
            ))}
            {podeEditar && <button onClick={()=>{setMenuOpen(false);setEmpModal('new')}} style={{display:'block',fontSize:10,color:'rgba(185,154,84,.55)',padding:'4px 0 4px 12px',cursor:'pointer',background:'none',border:'none',fontStyle:'italic',fontFamily:IN}}>+ Adicionar empreendimento</button>}
          </div>
        </div>
      )}

      {/* GRID EMPREENDIMENTOS — tela 3 do 4A */}
      <main style={{padding:'28px 20px 80px'}}>
        {showArchived && (
          <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:18}}>
            <button onClick={()=>setShowArchived(false)} style={{background:'none',border:'none',color:GOLD,cursor:'pointer',fontSize:11,letterSpacing:.1,fontFamily:IN}}>← Voltar</button>
            <div style={{fontSize:8,fontWeight:500,letterSpacing:'.22em',color:SUBTLE,textTransform:'uppercase'}}>Empreendimentos Arquivados</div>
          </div>
        )}
        {!showArchived && <div style={{fontSize:9,letterSpacing:'.2em',color:GOLD,textTransform:'uppercase',marginBottom:22}}>Empreendimentos</div>}

        {loading ? (
          <div style={{textAlign:'center',padding:60,color:SUBTLE,fontSize:12}}>Carregando...</div>
        ) : empsVisiveis.length===0 ? (
          <div style={{textAlign:'center',padding:60,color:SUBTLE,fontSize:12}}>
            {showArchived ? 'Nenhum empreendimento arquivado.' : 'Nenhum empreendimento cadastrado.'}
          </div>
        ) : (
          <div style={{display:'flex',flexDirection:'column',gap:22}}>
            {empsVisiveis.map(emp=>(
              <div key={emp.id} style={{cursor:'pointer',position:'relative'}}>
                <div onClick={()=>onSelectObra(emp)}
                  onMouseEnter={e=>e.currentTarget.style.transform='translateY(-3px)'}
                  onMouseLeave={e=>e.currentTarget.style.transform='translateY(0)'}
                  style={{transition:'transform .28s ease'}}>
                  {/* Imagem com border-radius grande */}
                  <div style={{width:'100%',aspectRatio:'16/7',borderRadius:20,overflow:'hidden',
                    background:'linear-gradient(160deg,#d9d2bf,#c3bba3)',position:'relative',
                    boxShadow:'0 12px 28px -10px rgba(60,52,30,.22)'}}>
                    {emp.foto && !imgErrors[emp.id]
                      ? <img src={emp.foto} alt={emp.nome} onError={()=>setImgErrors(p=>({...p,[emp.id]:true}))} style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}}/>
                      : null
                    }
                    {emp.arquivado && <div style={{position:'absolute',top:10,left:12,background:'rgba(230,81,0,.82)',color:WHITE,fontSize:8,letterSpacing:.2,padding:'3px 8px',textTransform:'uppercase',borderRadius:2}}>Arquivado</div>}
                  </div>
                  {/* Info — tipografia 4A */}
                  <div style={{padding:'12px 4px 0'}}>
                    <div style={{fontSize:9,letterSpacing:'.1em',color:GOLD,textTransform:'uppercase',marginBottom:3}}>
                      {emp.cidade}{emp.estado?' · '+emp.estado:''} · {emp.pais||'Brasil'}
                    </div>
                    <div style={{fontFamily:PF,fontSize:17,color:JET,marginTop:2,fontWeight:500}}>{emp.nome}</div>
                    <div style={{fontSize:11,color:MUTED,marginTop:5}}>● {emp.cert||'—'} · {emp.nivel||'—'}</div>
                  </div>
                </div>
                {/* Botão editar circular glassmorphism */}
                {podeEditar && (
                  <button onClick={e=>{e.stopPropagation();setEmpModal(emp)}}
                    style={{position:'absolute',top:12,right:12,width:30,height:30,borderRadius:'50%',
                      background:'rgba(22,20,15,.55)',backdropFilter:'blur(4px)',border:'none',
                      color:GOLD,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',
                      transition:'all .2s'}}
                    onMouseEnter={e=>e.currentTarget.style.background='rgba(22,20,15,.85)'}
                    onMouseLeave={e=>e.currentTarget.style.background='rgba(22,20,15,.55)'}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#B99A54" strokeWidth="1.8">
                      <path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z"/>
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      {/* BOTÃO + — preto com sombra */}
      {podeEditar && !showArchived && (
        <button onClick={()=>setEmpModal('new')}
          style={{position:'fixed',bottom:26,right:22,zIndex:50,width:52,height:52,borderRadius:'50%',
            background:JET,border:'none',color:'#faf8f3',fontSize:26,cursor:'pointer',
            display:'flex',alignItems:'center',justifyContent:'center',
            boxShadow:'0 10px 28px -8px rgba(0,0,0,.55)',lineHeight:1,transition:'transform .2s'}}
          onMouseEnter={e=>e.currentTarget.style.transform='scale(1.08)'}
          onMouseLeave={e=>e.currentTarget.style.transform='scale(1)'}>+</button>
      )}

      {/* PAINEL PERFIL */}
      <Panel open={panel==='perfil'} onClose={()=>{setPanel(null);setEditingProfile(false)}} title="Meu Perfil">
        <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:10,marginBottom:22}}>
          <div style={{width:64,height:64,borderRadius:'50%',background:BEIGE,border:`2px solid ${GOLD}`,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:PF,fontSize:20,fontWeight:500,color:JET}}>{currentUser?.initials||'?'}</div>
          <div style={{fontSize:8,letterSpacing:'.12em',color:GOLD,textTransform:'uppercase',cursor:'pointer',fontFamily:IN}}>Alterar foto</div>
        </div>
        {!editingProfile ? <>
          {[['Nome',profileForm.nome],['E-mail',profileForm.email],['Telefone',profileForm.telefone],['Perfil',ROLE_LABEL[profileForm.role]]].map(([l,v])=>(
            <div key={l} style={{marginBottom:14}}>
              <div style={{fontSize:8,letterSpacing:'.18em',color:GOLD,textTransform:'uppercase',marginBottom:4,fontFamily:IN}}>{l}</div>
              <div style={{fontSize:13,color:JET,padding:'7px 0',borderBottom:`1px solid ${BEIGE}`,fontFamily:IN}}>{v||'—'}</div>
            </div>
          ))}
          <button onClick={()=>setEditingProfile(true)} style={{width:'100%',background:JET,color:'#faf8f3',border:'none',padding:11,fontSize:9,letterSpacing:'.15em',textTransform:'uppercase',cursor:'pointer',marginTop:8,fontFamily:IN}}>✏️ Editar Perfil</button>
        </> : <>
          <FieldLight label="Nome" value={profileForm.nome} onChange={v=>setProfileForm({...profileForm,nome:v})}/>
          <FieldLight label="E-mail" value={profileForm.email} onChange={v=>setProfileForm({...profileForm,email:v})} type="email"/>
          <FieldLight label="Telefone" value={profileForm.telefone} onChange={v=>setProfileForm({...profileForm,telefone:v})}/>
          <FieldLight label="Nova senha (em branco = manter)" value={profileForm._newSenha||''} onChange={v=>setProfileForm({...profileForm,_newSenha:v})} type="password"/>
          <button onClick={handleSaveProfile} style={{width:'100%',background:JET,color:'#faf8f3',border:'none',padding:11,fontSize:9,letterSpacing:'.15em',textTransform:'uppercase',cursor:'pointer',marginTop:8,fontFamily:IN}}>Salvar</button>
          <button onClick={()=>setEditingProfile(false)} style={{width:'100%',background:'transparent',border:`1px solid ${BEIGE}`,color:JET,padding:11,fontSize:9,letterSpacing:'.15em',textTransform:'uppercase',cursor:'pointer',marginTop:8,fontFamily:IN}}>Cancelar</button>
        </>}
        <div style={{height:1,background:BEIGE,margin:'14px 0'}}/>
        <button onClick={()=>{setPanel(null);onLogout();}} style={{width:'100%',background:'transparent',border:`1px solid ${BEIGE}`,color:JET,padding:11,fontSize:9,letterSpacing:'.15em',textTransform:'uppercase',cursor:'pointer',marginBottom:8,fontFamily:IN}}>Sair do app</button>
        <button onClick={()=>{if(window.confirm('Excluir conta?')){setPanel(null);onLogout();}}} style={{width:'100%',textAlign:'left',background:'none',border:'none',borderBottom:`1px solid ${BEIGE}`,padding:'10px 0',fontSize:9,letterSpacing:'.12em',textTransform:'uppercase',color:'#8b2020',cursor:'pointer',fontFamily:IN}}>Excluir conta →</button>
      </Panel>

      {/* PAINEL CONFIGURAÇÕES */}
      <Panel open={panel==='settings'} onClose={()=>setPanel(null)} title="Configurações">
        {[['Plataforma','VĒRIS by Lotus'],['Versão','2.0.0']].map(([l,v])=>(
          <div key={l} style={{marginBottom:14}}>
            <div style={{fontSize:8,letterSpacing:'.18em',color:GOLD,textTransform:'uppercase',marginBottom:4,fontFamily:IN}}>{l}</div>
            <div style={{fontSize:13,color:JET,padding:'7px 0',borderBottom:`1px solid ${BEIGE}`,fontFamily:IN}}>{v}</div>
          </div>
        ))}
        <a href="mailto:taynara.alves@lotuscidade.com.br?subject=Suporte VĒRIS"
          style={{display:'block',padding:'10px 0',fontSize:9,letterSpacing:'.12em',textTransform:'uppercase',color:GOLD,borderBottom:`1px solid ${BEIGE}`,textDecoration:'none',fontFamily:IN}}>Suporte técnico →</a>
        <button onClick={()=>{setPanel(null);onLogout();}} style={{width:'100%',textAlign:'left',background:'none',border:'none',borderBottom:`1px solid ${BEIGE}`,padding:'10px 0',fontSize:9,letterSpacing:'.12em',textTransform:'uppercase',color:'#8b2020',cursor:'pointer',fontFamily:IN}}>Sair da conta →</button>
      </Panel>

      {/* PAINEL USUÁRIOS */}
      <Panel open={panel==='usuarios'} onClose={()=>setPanel(null)} title="Usuários" wide>
        {['adm_global','adm_empreendimento','visualizador'].map(role=>{
          const grupo=usuarios.filter(u=>u.role===role); if(!grupo.length)return null
          return (
            <div key={role} style={{marginBottom:20}}>
              <div style={{fontSize:8,letterSpacing:'.18em',color:GOLD,textTransform:'uppercase',marginBottom:10,fontFamily:IN}}>{ROLE_LABEL[role]}</div>
              {grupo.map(u=>(
                <div key={u.id} style={{border:`1px solid ${BEIGE}`,padding:'11px 13px',display:'flex',alignItems:'center',gap:11,marginBottom:5,borderRadius:4}}>
                  <div style={{width:32,height:32,borderRadius:'50%',background:BEIGE,display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:600,color:JET,flexShrink:0,fontFamily:PF}}>{u.initials||u.nome?.slice(0,2).toUpperCase()}</div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:12,fontWeight:500,color:JET,fontFamily:IN}}>{u.nome}</div>
                    <div style={{fontSize:10,color:SUBTLE,marginTop:2,fontFamily:IN}}>{u.email}</div>
                  </div>
                  {u.projeto && <span style={{fontSize:7,fontWeight:600,letterSpacing:'.1em',textTransform:'uppercase',padding:'3px 7px',background:'rgba(22,20,15,.06)',color:MUTED,borderRadius:2,fontFamily:IN}}>{u.projeto}</span>}
                  {isAdmGlobal && <button onClick={()=>setUserModal(u)} style={{background:'none',border:`1px solid ${BEIGE}`,color:MUTED,borderRadius:3,padding:'3px 7px',fontSize:10,cursor:'pointer'}}>✏️</button>}
                </div>
              ))}
            </div>
          )
        })}
        {isAdmGlobal && <button onClick={()=>setUserModal({})} style={{width:'100%',background:'transparent',border:`1px dashed ${BEIGE}`,padding:11,fontSize:9,letterSpacing:'.15em',textTransform:'uppercase',color:GOLD,cursor:'pointer',marginTop:8,fontFamily:IN,borderRadius:3}}>+ Convidar / Criar usuário</button>}
      </Panel>

      {empModal && <EmpModal emp={empModal==='new'?null:empModal} onClose={()=>setEmpModal(null)} onSave={handleSaveEmp} onDelete={handleDeleteEmp} onArchive={handleArchiveEmp}/>}
      {userModal && <UserModal user={userModal?.id?userModal:null} onClose={()=>setUserModal(null)} onSave={handleSaveUser} isAdmGlobal={isAdmGlobal}/>}
    </div>
  )
}
